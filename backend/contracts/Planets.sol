//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./Base.sol";
import "./PlanetsThumbnail.sol";
import "./Utilities.sol";
import "./interfaces/IPlanets.sol";
import "./interfaces/IPlanetsRenderer.sol";
import "scripty.sol/contracts/scripty/IScriptyBuilder.sol";

contract Planets is Base {
  address public immutable _ethfsFileStorageAddress;
  address public immutable _scriptyBuilderAddress;
  uint256 public immutable _supply;
  address public _thumbnailAddress;
  address public _rendererAddress;

  uint256 public _price;
  bool public _isOpen;

  error MintClosed();
  error ContractMinter();
  error SoldOut();
  error GreedyMinter();
  error InsufficientFunds();
  error WalletMax();
  error TokenDoesntExist();
  error InvalidSignature();

  constructor(
    string memory name,
    string memory symbol,
    uint256 supply,
    uint256 price,
    address ethfsFileStorageAddress,
    address scriptyBuilderAddress,
    address thumbnailAddress,
    address rendererAddress
  ) Base(name, symbol) {
    _ethfsFileStorageAddress = ethfsFileStorageAddress;
    _scriptyBuilderAddress = scriptyBuilderAddress;
    _thumbnailAddress = thumbnailAddress;
    _rendererAddress = rendererAddress;

    _supply = supply;
    _price = price;

    // mint reserve of 20 for friends that helped
    // and a few giveaways
    _safeMint(msg.sender, 20, "");
  }

  /**
   * @notice Mints new tokens for the caller.
   * @param _quantity Quantity of tokens to mint.
   */
  function mint(uint256 _quantity) public payable {
    if (msg.value < _price * _quantity) revert InsufficientFunds();
    if (totalMinted() + _quantity > _supply) revert SoldOut();
    if (_numberMinted(msg.sender) + _quantity > 20) revert WalletMax();

    _mint(msg.sender, _quantity);

    // Refund any extra ETH sent
    if (msg.value > _price * _quantity) {
      (bool status, ) = payable(msg.sender).call{value: msg.value - _price * _quantity}("");
      require(status, "Refund failed");
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
   * @param price - The new price.
   */
  function setPrice(uint256 price) external onlyOwner {
    _price = price;
  }

  /**
   * @notice Update thumbnail contract address
   * @param thumbnailAddress - Address of the thumbnail contract.
   */
  function setThumbnailAddress(address thumbnailAddress) external onlyOwner {
    if (_totalMinted() == _supply) revert SoldOut();
    _thumbnailAddress = thumbnailAddress;
  }

  /**
   * @notice Open or close minting
   * @param state - Boolean state for being open or closed.
   */
  function setMintStatus(bool state) external onlyOwner {
    _isOpen = state;
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
    varString = abi.encodePacked("var ", _name, '="', utils.uint2str(_seed), '";');
  }

  /**
   * @notice Build all the settings into a struct
   * @param tokenId - Value as string
   * @return settings - All settings as a struct
   */
  function buildSettings(uint256 tokenId) internal pure returns (Settings memory settings) {
    // TODO
    (uint256 seed, bytes memory varSeed) = genVar(tokenId, "seed", 1, 1000000);
    settings.seed = seed;
    settings.vars[0] = varSeed;
  }

  /**
   * @notice Util function to help build traits
   * @param key - Trait key as string
   * @param value - Trait value as string
   * @return trait - object as string
   */
  function buildTrait(string memory key, string memory value) internal pure returns (string memory trait) {
    return string.concat('{"trait_type":"', key, '","value": "', value, '"}');
  }

  /**
   * @notice Build attributes for metadata
   * @param settings - Track settings struct
   * @return attr - array as a string
   */
  function buildAttributes(Settings memory settings) internal pure returns (bytes memory attr) {
    // TODO
    return
      abi.encodePacked(
        '"attributes": [',
        buildTrait("Seed", utils.uint2str(settings.seed)),
        // ",",
        // buildTrait("Biome", settings.biomeName),
        // ",",
        // buildTrait("Orientation", orientation),
        // ",",
        // buildTrait("Speed", speedString),
        // ",",
        // buildTrait("World Scale", scaleString),
        "]"
      );
  }

  /**
   * @notice Pack and base64 encode JS compatible vars
   * @param settings - Track settings struct
   * @return vars - base64 encoded JS compatible setting variables
   */
  function buildVars(Settings memory settings) internal pure returns (bytes memory vars) {
    // TODO
    return
      bytes(
        utils.encode(
          abi.encodePacked(
            settings.vars[0],
            settings.vars[1],
            settings.vars[2],
            settings.vars[3],
            settings.vars[4],
            settings.vars[5]
          )
        )
      );
  }

  /**
   * @notice Build the metadata including the full render html for the coaster
   * @dev This depends on
   *      - https://ethfs.xyz/ [stores code libraries]
   *      - https://github.com/intartnft/scripty.sol [builds rendering html and stores code libraries]
   * @param tokenId - TokenId to build coaster for
   * @return metadata - as string
   */
  function tokenURI(uint256 tokenId) public view virtual override(ERC721A, IERC721A) returns (string memory metadata) {
    // show nothing if token doesnt exist
    if (!_exists(tokenId)) revert TokenDoesntExist();

    // Generate all the settings and various objects for the metadata
    Settings memory settings = buildSettings(tokenId);
    bytes memory attr = buildAttributes(settings);
    bytes memory vars = buildVars(settings);
    string memory thumbnail = utils.encode(PlanetsThumbnail(_thumbnailAddress).buildThumbnail(settings));

    bytes memory animationUri = IPlanetsRenderer(_rendererAddress).buildAnimationURI(settings, vars);

    // TODO: Update this
    bytes memory json = abi.encodePacked(
      '{"name":"',
      "Planet: #",
      utils.uint2str(tokenId),
      '", "description":"',
      "All the models and code are compressed then stored, and retrieved from the blockchain.",
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
