//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./Base.sol";
import "./PlanetsThumbnail.sol";
import "./Utilities.sol";
import "./interfaces/IPlanets.sol";
import "./interfaces/IPlanetsRenderer.sol";
import "scripty.sol/contracts/scripty/IScriptyBuilder.sol";

contract Planets is Base {
  uint256 public immutable supply;
  address public thumbnailAddress;
  address public rendererAddress;

  uint256 public price;
  bool public isOpen;

  error MintClosed();
  error SoldOut();
  error InsufficientFunds();
  error WalletMax();
  error TokenDoesntExist();
  error RefundFailed();

  constructor(
    string memory name,
    string memory symbol,
    uint256 _supply,
    uint256 _price,
    address _thumbnailAddress,
    address _rendererAddress
  ) Base(name, symbol) {
    thumbnailAddress = _thumbnailAddress;
    rendererAddress = _rendererAddress;

    supply = _supply;
    price = _price;
  }

  /**
   * @notice  Airdrops tokens to a list of recipients. Only callable by the contract owner.
   * @param _recipients List of recipients to receive the airdrop.
   * @param _quantity Quantity of tokens to airdrop to each recipient.
   */
  function airdrop(address[] calldata _recipients, uint256 _quantity) external payable onlyOwner {
    if (totalMinted() + _recipients.length * _quantity > supply) revert SoldOut();
    for (uint256 i = 0; i < _recipients.length; i++) {
      _mint(_recipients[i], _quantity);
    }
  }

  /**
   * @notice Mints new tokens for the caller.
   * @param _quantity Quantity of tokens to mint.
   */
  function mint(uint256 _quantity) public payable {
    if (msg.value < price * _quantity) revert InsufficientFunds();
    if (totalMinted() + _quantity > supply) revert SoldOut();
    if (_numberMinted(msg.sender) + _quantity > 20) revert WalletMax();

    _mint(msg.sender, _quantity);

    // Refund any extra ETH sent
    if (msg.value > price * _quantity) {
      (bool status, ) = payable(msg.sender).call{value: msg.value - price * _quantity}("");
      if (!status) revert RefundFailed();
    }
  }

  /**
   * @notice Withdraws the contract's balance. Only callable by the contract owner.
   */
  function withdraw() external onlyOwner {
    require(payable(msg.sender).send(address(this).balance));
  }

  /**
   * @notice Update the mint price.
   * @dev Very doubtful this gets used, but good to have
   * @param _price - The new price.
   */
  function setPrice(uint256 _price) external onlyOwner {
    price = _price;
  }

  /**
   * @notice Update thumbnail contract address
   * @param _thumbnailAddress - Address of the thumbnail contract.
   */
  function setThumbnailAddress(address _thumbnailAddress) external onlyOwner {
    thumbnailAddress = _thumbnailAddress;
  }

  /**
   * @notice Update renderer contract address
   * @param _rendererAddress - Address of the renderer contract.
   */
  function setRendererAddress(address _rendererAddress) external onlyOwner {
    rendererAddress = _rendererAddress;
  }

  /**
   * @notice Open or close minting
   * @param _state - Boolean state for being open or closed.
   */
  function setMintStatus(bool _state) external onlyOwner {
    isOpen = _state;
  }

  /**
   * @notice Minting starts at token id #1
   * @return Token id to start minting at
   */
  function _startTokenId() internal pure override returns (uint256) {
    return 1;
  }

  /**
   * @notice Retrieve how many tokens have been minted
   * @return Total number of minted tokens
   */
  function totalMinted() public view returns (uint256) {
    return _totalMinted();
  }

  function genVar(
    uint256 _seed,
    string memory _name,
    uint256 _low,
    uint256 _high
  ) internal pure returns (uint256 value, bytes memory varString) {
    value = utils.randomRange(_seed, _name, _low, _high);
    varString = abi.encodePacked("var ", _name, "=", utils.uint2str(value), ";");
  }

  /**
   * @notice Build all the settings into a struct
   * @param _tokenId - Token ID for seed value
   * @return settings - All settings as a struct
   */
  function buildSettings(uint256 _tokenId) internal pure returns (Settings memory settings) {
    (uint256 seed, bytes memory varSeed) = genVar(_tokenId, "seed", 1, 1000000);
    settings.seed = seed;
    settings.vars[0] = varSeed;

    (uint256 planetSize, bytes memory varPlanetSize) = genVar(_tokenId, "planetSize", 30, 170);
    settings.planetSize = planetSize;
    settings.vars[1] = varPlanetSize;

    (uint256 hasRings, bytes memory varHasRings) = genVar(_tokenId, "hasRings", 0, 1);
    settings.hasRings = hasRings == 1;
    settings.vars[2] = varHasRings;

    (uint256 numMoons, bytes memory varNumMoons) = genVar(_tokenId, "numMoons", 0, 5);
    settings.numMoons = numMoons;
    settings.vars[3] = varNumMoons;

    (uint256 planetType, bytes memory varPlanetType) = genVar(_tokenId, "planetType", 0, 1);
    settings.planetType = PlanetType(planetType);
    settings.vars[4] = varPlanetType;

    (uint256 planetColor, bytes memory varPlanetColor) = genVar(_tokenId, "baseHue", 0, 360);
    settings.hue = planetColor;
    settings.vars[5] = varPlanetColor;

    return settings;
  }

  /**
   * @notice Util function to help build traits
   * @param _key - Trait key as string
   * @param _value - Trait value as string
   * @return trait - object as string
   */
  function buildTrait(string memory _key, string memory _value) internal pure returns (string memory trait) {
    return string.concat('{"trait_type":"', _key, '","value": "', _value, '"}');
  }

  /**
   * @notice Build attributes for metadata
   * @param settings - Track settings struct
   * @return attr - array as a string
   */
  function buildAttributes(Settings memory settings) internal pure returns (bytes memory attr) {
    return
      abi.encodePacked(
        '"attributes": [',
        buildTrait("Seed", utils.uint2str(settings.seed)),
        ",",
        buildTrait("Planet Size", utils.uint2str(settings.planetSize)),
        ",",
        buildTrait("Has Rings", settings.hasRings ? "Yes" : "No"),
        ",",
        buildTrait("Number of Moons", utils.uint2str(settings.numMoons)),
        ",",
        buildTrait("Planet Type", settings.planetType == PlanetType.SOLID ? "Rocky" : "Gaseous"),
        ",",
        buildTrait("Planet Color", utils.getColorName(settings.hue)),
        "]"
      );
  }

  /**
   * @notice Pack and base64 encode JS compatible vars
   * @param settings - Track settings struct
   * @return vars - base64 encoded JS compatible setting variables
   */
  function buildVars(Settings memory settings) internal pure returns (bytes memory vars) {
    return
      bytes(
        utils.encode(
          abi.encodePacked(settings.vars[0], settings.vars[1], settings.vars[2], settings.vars[3], settings.vars[4])
        )
      );
  }

  /**
   * @notice Build the metadata including the full render html for the coaster
   * @dev This depends on
   *      - https://ethfs.xyz/ [stores code libraries]
   *      - https://github.com/intartnft/scripty.sol [builds rendering html and stores code libraries]
   * @param _tokenId - TokenId to build coaster for
   * @return metadata - as string
   */
  function tokenURI(uint256 _tokenId) public view virtual override(ERC721A, IERC721A) returns (string memory metadata) {
    // show nothing if token doesnt exist
    if (!_exists(_tokenId)) revert TokenDoesntExist();

    // Generate all the settings and various objects for the metadata
    Settings memory settings = buildSettings(_tokenId);
    bytes memory attr = buildAttributes(settings);
    bytes memory vars = buildVars(settings);
    string memory thumbnail = utils.encode(PlanetsThumbnail(thumbnailAddress).buildThumbnail(settings));

    bytes memory animationUri = IPlanetsRenderer(rendererAddress).buildAnimationURI(vars);

    // TODO: Update this
    bytes memory json = abi.encodePacked(
      '{"name":"',
      "EtherPlanet #",
      utils.uint2str(_tokenId),
      '", "description":"',
      "Fully on-chain, procedurally generated, 3D planets.",
      '","image":"data:image/svg+xml;base64,',
      thumbnail,
      '","animation_url":"',
      animationUri,
      '",',
      attr,
      "}"
    );

    return string(abi.encodePacked("data:application/json,", json));
  }
}
