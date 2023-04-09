//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./interfaces/IPlanets.sol";
import "./Utilities.sol";

contract PlanetsThumbnail {
  /**
   * @notice Build the SVG thumbnail
   * @param _settings - Track settings struct
   * @return final svg as bytes
   */
  function buildThumbnail(Settings calldata _settings) external pure returns (bytes memory) {
    return
      abi.encodePacked(
        '<svg preserveAspectRatio="xMidYMid meet" width="100%" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">',
        '<text x="50" y="50">Seed: ',
        utils.uint2str(_settings.seed),
        "</text>",
        "</svg>"
      );
  }
}
