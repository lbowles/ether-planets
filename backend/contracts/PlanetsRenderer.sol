//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./interfaces/IPlanetsRenderer.sol";
import "./interfaces/IPlanets.sol";

contract PlanetsRenderer is IPlanetsRenderer {
  address public immutable _ethfsFileStorageAddress;
  address public immutable _scriptyBuilderAddress;

  constructor(address ethfsFileStorageAddress, address scriptyBuilderAddress) {
    _ethfsFileStorageAddress = ethfsFileStorageAddress;
    _scriptyBuilderAddress = scriptyBuilderAddress;
  }

  /**
   * @notice Use Scripty to generate the final html
   * @dev I opted for the lazy dev approach and let scripty calculate the required buffersize
   *      This could be calculated and passed to the contract at any point prior to its use
   *      in `getHTMLWrappedURLSafe`
   * @param _settings - Array of WrappedScriptRequest data
   * @param _vars - Variables to be injected
   * @return html - as bytes
   */
  function buildAnimationURI(
    Settings calldata _settings,
    bytes calldata _vars
  ) external view returns (bytes memory html) {
    // To build the html I use Scripty to manage all the annoying tagging and html construction
    // A combination of EthFS and Scripty is used for storage and this array stores the required
    // code data
    WrappedScriptRequest[] memory requests = new WrappedScriptRequest[](4);

    // Step 1.
    // - create custom content blocks that have no wrapper
    // - we do this to easily inject css and dom elements
    // - double urlencoded
    // - first block is css + some JS
    // - second block is coaster settings [biome + speed]
    //
    // Final Output:
    // https://github.com/intartnft/scripty.sol/blob/main/contracts/scripty/ScriptyBuilder.sol#L648
    // [double urlencoded data]

    requests[0].wrapType = 4;
    requests[0]
      .scriptContent = "%253Cstyle%253Ebody%252Chtml%257Boverflow%253Ahidden%253Bmargin%253A0%253Bwidth%253A100%2525%253Bheight%253A100%2525%257D%2523overlay%257Bposition%253Aabsolute%253Bwidth%253A100vw%253Bheight%253A100vh%253Btransition%253A.75s%2520ease-out%253Bbackground-color%253A%2523e2e8f0%253Bdisplay%253Aflex%253Bflex-direction%253Acolumn%253Bjustify-content%253Acenter%253Balign-items%253Acenter%257D.bbg%257Bwidth%253A75%2525%253Bmargin%253A1rem%253Bbackground-color%253A%2523cbd5e1%253Bmax-width%253A400px%253Bborder-radius%253A2rem%253Bheight%253A.8rem%257D.bbar%257Bbackground-color%253A%25236366f1%253Bwidth%253A5%2525%253Bborder-radius%253A2rem%253Bheight%253A.8rem%257D%2523info%257Bfont-family%253ATahoma%252CArial%252CHelvetica%252Csans-serif%253Bfont-size%253A.8rem%253Bcolor%253A%2523475569%253Bmin-height%253A1rem%257D%2523controls%257Bposition%253Aabsolute%253Bbottom%253A20px%253Bleft%253A20px%257D%2523camber%257Bborder%253A1px%2520solid%2520%2523fff%253Bborder-radius%253A4px%253Bbackground%253Argba(0%252C0%252C0%252C.1)%253Bcolor%253A%2523dc2626%253Btext-align%253Acenter%253Bopacity%253A.5%253Boutline%253A0%253Bmouse%253Apointer%257D%2523camber.active%257Bbackground%253Argba(255%252C255%252C255%252C.5)%253Bcolor%253A%252316a34a%253Bopacity%253A1%257D%2523camber%2520svg%257Bwidth%253A36px%253Bheight%253A36px%257D%253C%252Fstyle%253E%253Cdiv%2520id%253D'overlay'%253E%253Cdiv%2520class%253D'bbg'%253E%253Cdiv%2520id%253D'bar'%2520class%253D'bbar'%253E%253C%252Fdiv%253E%253C%252Fdiv%253E%253Cdiv%2520id%253D'info'%253E%253C%252Fdiv%253E%253C%252Fdiv%253E%253Ccanvas%2520id%253D'coaster'%253E%253C%252Fcanvas%253E%253Cdiv%2520id%253D'controls'%253E%253Cbutton%2520id%253D'camber'%2520onclick%253D'toggleActive()'%253E%253Csvg%2520viewBox%253D'0%25200%252012.7%252012.7'%2520xmlns%253D'http%253A%252F%252Fwww.w3.org%252F2000%252Fsvg'%253E%253Cg%2520style%253D'stroke%253AcurrentColor%253Bstroke-width%253A.6%253Bstroke-linecap%253Around%253Bfill%253Anone'%253E%253Crect%2520width%253D'4.217'%2520height%253D'4.217'%2520x%253D'4.257'%2520y%253D'5.388'%2520ry%253D'.31'%2520rx%253D'.31'%252F%253E%253Cpath%2520d%253D'm12.37%25206.919-.935%25201.16-1.145-1.025M.487%25206.919l.936%25201.16%25201.145-1.025'%2520transform%253D'matrix(.94246%25200%25200%2520.9392%2520.291%2520.21)'%252F%253E%253Cpath%2520d%253D'M-1.464-8.007a4.99%25205.036%25200%25200%25201-2.495%25204.36%25204.99%25205.036%25200%25200%25201-4.99%25200%25204.99%25205.036%25200%25200%25201-2.495-4.36'%2520transform%253D'matrix(-.94246%25200%25200%2520-.9392%2520.291%2520.21)'%252F%253E%253C%252Fg%253E%253C%252Fsvg%253E%253C%252Fbutton%253E%253C%252Fdiv%253E";

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

    // Step 4.
    // - pull the gzipped p5 lib from EthFS
    // - wrapType 2 will handle the gzip script wrappers
    //
    // Final Output:
    // https://github.com/intartnft/scripty.sol/blob/main/contracts/scripty/ScriptyBuilder.sol#L642
    // <script type="text/javascript+gzip" src="data:text/javascript;base64,[p5-v1.5.0.min.js.gz]"></script>

    requests[2].name = "p5-v1.5.0.min.js.gz";
    requests[2].wrapType = 2;
    requests[2].contractAddress = _ethfsFileStorageAddress;

    // Step 6.
    // - pull the gunzip handler from EthFS
    // - wrapType 1 will handle the script tags
    //
    // Final Output:
    // https://github.com/intartnft/scripty.sol/blob/main/contracts/scripty/ScriptyBuilder.sol#L638
    // <script src="data:text/javascript;base64,[gunzipScripts-0.0.1.js]"></script>

    requests[3].name = "gunzipScripts-0.0.1.js";
    requests[3].wrapType = 1;
    requests[3].contractAddress = _ethfsFileStorageAddress;

    IScriptyBuilder iScriptyBuilder = IScriptyBuilder(_scriptyBuilderAddress);
    uint256 bufferSize = iScriptyBuilder.getBufferSizeForURLSafeHTMLWrapped(requests);
    return iScriptyBuilder.getHTMLWrappedURLSafe(requests, bufferSize);
  }
}
