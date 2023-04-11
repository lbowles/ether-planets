//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./interfaces/IPlanetsRenderer.sol";
import "./interfaces/IPlanets.sol";

contract PlanetsRenderer is IPlanetsRenderer {
  address public immutable ethfsFileStorageAddress;
  address public immutable scriptyBuilderAddress;
  address public immutable scriptyStorageAddress;
  string public etherPlanetsScriptName;

  constructor(
    address _ethfsFileStorageAddress,
    address _scriptyBuilderAddress,
    address _scriptyStorageAddress,
    string memory _etherPlanetsScriptName
  ) {
    ethfsFileStorageAddress = _ethfsFileStorageAddress;
    scriptyBuilderAddress = _scriptyBuilderAddress;
    scriptyStorageAddress = _scriptyStorageAddress;
    etherPlanetsScriptName = _etherPlanetsScriptName;
  }

  /**
   * @notice Use Scripty to generate the final html
   * @dev I opted for the lazy dev approach and let scripty calculate the required buffersize
   *      This could be calculated and passed to the contract at any point prior to its use
   *      in `getHTMLWrappedURLSafe`
   * @param _vars - Variables to be injected
   * @return html - as bytes
   */
  function buildAnimationURI(bytes calldata _vars) external view returns (bytes memory html) {
    // To build the html I use Scripty to manage all the annoying tagging and html construction
    // A combination of EthFS and Scripty is used for storage and this array stores the required
    // code data
    WrappedScriptRequest[] memory requests = new WrappedScriptRequest[](5);

    // Step 1.
    // - create custom content blocks that have no wrapper
    // - we do this to easily inject css and dom elements
    // - double urlencoded
    // - first block is css + some JS
    // - second block is planet settings [planet traits]
    //
    // Final Output:
    // https://github.com/intartnft/scripty.sol/blob/main/contracts/scripty/ScriptyBuilder.sol#L648
    // [double urlencoded data]

    requests[0].wrapType = 4;
    requests[0]
      .scriptContent = "%253Cstyle%253E%250A%2520%2520body%252C%250A%2520%2520html%2520%257B%250A%2520%2520%2520%2520overflow%253A%2520hidden%253B%250A%2520%2520%2520%2520margin%253A%25200%253B%250A%2520%2520%2520%2520width%253A%2520100%2525%253B%250A%2520%2520%2520%2520height%253A%2520100%2525%253B%250A%2520%2520%257D%250A%2520%2520body%2520%257B%250A%2520%2520%2520%2520background-color%253A%2520black%253B%250A%2520%2520%257D%250A%253C%252Fstyle%253E";

    // Step 2.
    // - wrap the JS variables in <script>
    // - no name is needed as we are injected the code rather than
    //   pulling it from a contract (scriptyStorage/EthFS)
    // - wrapType 1 w/ script content
    //
    //
    // Final Output:
    // https://github.com/intartnft/scripty.sol/blob/main/contracts/scripty/ScriptyBuilder.sol#L638
    // <script src="data:text/javascript;base64,[vars]"></script>

    requests[1].name = "";
    requests[1].wrapType = 1;
    requests[1].scriptContent = _vars;

    // Step 3.
    // - pull the gzipped p5 lib from EthFS
    // - wrapType 2 will handle the gzip script wrappers
    //
    // Final Output:
    // https://github.com/intartnft/scripty.sol/blob/main/contracts/scripty/ScriptyBuilder.sol#L642
    // <script type="text/javascript+gzip" src="data:text/javascript;base64,[p5-v1.5.0.min.js.gz]"></script>

    requests[2].name = "p5-v1.5.0.min.js.gz";
    requests[2].wrapType = 2;
    requests[2].contractAddress = ethfsFileStorageAddress;

    // Step 4.
    // - pull the planet code from scriptyStorage
    //   I could have stored on EthFS, but wanted to show that pulling from
    //   another contract is possible.
    // - wrapType 2 will handle the gzip script wrappers
    //
    // Final Output:
    // https://github.com/intartnft/scripty.sol/blob/main/contracts/scripty/ScriptyBuilder.sol#L642
    // <script type="text/javascript+gzip" src="data:text/javascript;base64,[filename.min.js.gz]"></script>

    requests[3].name = etherPlanetsScriptName;
    requests[3].wrapType = 2;
    requests[3].contractAddress = scriptyStorageAddress;

    // Step 4.
    // - pull the gunzip handler from EthFS
    // - wrapType 1 will handle the script tags
    //
    // Final Output:
    // https://github.com/intartnft/scripty.sol/blob/main/contracts/scripty/ScriptyBuilder.sol#L638
    // <script src="data:text/javascript;base64,[gunzipScripts-0.0.1.js]"></script>

    requests[4].name = "gunzipScripts-0.0.1.js";
    requests[4].wrapType = 1;
    requests[4].contractAddress = ethfsFileStorageAddress;

    IScriptyBuilder IScriptyBuilder_ = IScriptyBuilder(scriptyBuilderAddress);
    uint256 bufferSize = IScriptyBuilder_.getBufferSizeForURLSafeHTMLWrapped(requests);
    return IScriptyBuilder_.getHTMLWrappedURLSafe(requests, bufferSize);
  }
}
