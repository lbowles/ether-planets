pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ProceduralPlanetNFT is ERC721Enumerable {
    using Strings for uint256;

    uint256 public constant NUM_COLORS = 5;
    uint256 public constant NUM_THRESHOLDS = 4;
    uint256 public constant NUM_STARS = 1000;

    struct Planet {
        uint256 seed;
        uint8[NUM_COLORS] colors;
        uint256[NUM_THRESHOLDS] thresholds;
        uint256 planetSize;
        uint256 glowSize;
    }

    Planet[] public planets;

    constructor() ERC721("ProceduralPlanet", "PPN") {}

    function mintPlanet(uint256 seed) public {
        uint8[NUM_COLORS] memory colors;
        uint256[NUM_THRESHOLDS] memory thresholds;

        for (uint256 i = 0; i < NUM_COLORS; i++) {
            colors[i] = uint8(seed % 256);
            seed /= 256;
        }

        for (uint256 i = 0; i < NUM_THRESHOLDS; i++) {
            thresholds[i] = seed % 1000;
            seed /= 1000;
        }

        uint256 planetSize = (seed % 201) + 50;
        seed /= 201;
        uint256 glowSize = planetSize + (seed % 31) + 10;
        seed /= 31;

        Planet memory newPlanet = Planet(
            seed,
            colors,
            thresholds,
            planetSize,
            glowSize
        );
        planets.push(newPlanet);
        _mint(msg.sender, planets.length - 1);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        Planet storage planet = planets[tokenId];
        string
            memory minifiedCode = "e1xydGYxXGFuc2lcYW5zaWNwZzEyNTJcY29jb2FydGYyNzA2Clxjb2NvYXRleHRzY2FsaW5nMFxjb2NvYXBsYXRmb3JtMHtcZm9udHRibFxmMFxmc3dpc3NcZmNoYXJzZXQwIEFyaWFsTVQ7fQp7XGNvbG9ydGJsO1xyZWQyNTVcZ3JlZW4yNTVcYmx1ZTI1NTtccmVkMjU1XGdyZWVuMjU1XGJsdWUyNTU7XHJlZDBcZ3JlZW4wXGJsdWUwO30Ke1wqXGV4cGFuZGVkY29sb3J0Ymw7O1xjc3NyZ2JcYzEwMDAwMFxjMTAwMDAwXGMxMDAwMDA7XGNzc3JnYlxjMFxjMFxjMDt9ClxwYXBlcncxMTkwMFxwYXBlcmgxNjg0MFxtYXJnbDE0NDBcbWFyZ3IxNDQwXHZpZXd3MTE1MjBcdmlld2g4NDAwXHZpZXdraW5kMApcZGVmdGFiNzIwClxwYXJkXHBhcmRlZnRhYjcyMFxwYXJ0aWdodGVuZmFjdG9yMAoKXGYwXGZzMzIgXGNmMCBcY2IyIFxleHBuZDBcZXhwbmR0dzBca2VybmluZzAKXG91dGwwXHN0cm9rZXdpZHRoMCBcc3Ryb2tlYzMgbGV0IGFuZ2xlPTAsdGV4dHVyZUltZyxzdGFycz1bXSxwbGFuZXRTaXplLGdsb3dTaXplO2Z1bmN0aW9uIHNldHVwKClce2NyZWF0ZUNhbnZhcyg0MDAsNDAwLFdFQkdMKTtsZXQgJD1bXTtmb3IobGV0IGU9MDtlPDU7ZSsrKSQucHVzaChjb2xvcihyYW5kb20oMjU1KSxyYW5kb20oMjU1KSxyYW5kb20oMjU1KSkpO2xldCB0PVtdO2ZvcihsZXQgbD0wO2w8NDtsKyspdC5wdXNoKHJhbmRvbSgpKTt0LnNvcnQoKTtsZXQgcj1ce3RocmVzaG9sZHM6dCxjb2xvcnM6JFx9O3RleHR1cmVJbWc9Z2VuZXJhdGVUZXh0dXJlKHIudGhyZXNob2xkcyxyLmNvbG9ycyk7Zm9yKGxldCBvPTA7bzwxZTM7bysrKXN0YXJzLnB1c2goXHt4OnJhbmRvbSgtKDUqd2lkdGgpLDUqd2lkdGgpLHk6cmFuZG9tKC0oNSpoZWlnaHQpLDUqaGVpZ2h0KSx6OnJhbmRvbSg1KndpZHRoKSxyYWRpdXM6cmFuZG9tKC41LDIpXH0pO2dsb3dTaXplPShwbGFuZXRTaXplPXJhbmRvbSg1MCwyNTApKStyYW5kb20oMTAsNDApXH1mdW5jdGlvbiBnZW5lcmF0ZVRleHR1cmUoJCxlKVx7bGV0IHQ9Y3JlYXRlR3JhcGhpY3MoMTAyNCw1MTIpO3Qubm9pc2VTZWVkKHJhbmRvbSgxZTMpKTtmb3IobGV0IGw9MDtsPHQud2lkdGg7bCsrKWZvcihsZXQgcj0wO3I8dC5oZWlnaHQ7cisrKVx7bGV0IG89dC5ub2lzZSguMDEqbCwuMDEqcikscz1jb2xvcigwKTtmb3IobGV0IG49MDtuPCQubGVuZ3RoO24rKylpZihvPCRbbl0pXHtzPWxlcnBDb2xvcihlW25dLGVbbisxXSwoby0oMD09PW4/MDokW24tMV0pKSooMS8oJFtuXS0oMD09PW4/MDokW24tMV0pKSkpO2JyZWFrXH10LnNldChsLHIscylcfXJldHVybiB0LnVwZGF0ZVBpeGVscygpLHRcfWZ1bmN0aW9uIGRyYXcoKVx7Zm9yKGxldCAkIG9mKGJhY2tncm91bmQoMCkscHVzaCgpLHRyYW5zbGF0ZSgwLDAsLTEyMDApLHN0YXJzKSlzdHJva2UoMjU1KSxzdHJva2VXZWlnaHQoJC5yYWRpdXMpLHBvaW50KCQueCwkLnksJC56KTtwb3AoKSxhbWJpZW50TGlnaHQoMTAwKSxhbWJpZW50TWF0ZXJpYWwoMCkscG9pbnRMaWdodCgyNTUsMjU1LDI1NSwtNDAwLC0yMDAsMTIwMCk7bGV0IGU9NDUwKnNpbihhdGFuMihtb3VzZVktaGVpZ2h0LzIsbW91c2VYLXdpZHRoLzIpKSx0PTQ1MCpjb3MoYXRhbjIobW91c2VZLWhlaWdodC8yLG1vdXNlWC13aWR0aC8yKSk7Y2FtZXJhKGUsdCw0NTAsMCwwLDAsMCwxLDApLHJvdGF0ZVkoYW5nbGUpLGFuZ2xlKz0uMDA1LHRleHR1cmUodGV4dHVyZUltZyksbm9TdHJva2UoKSxzcGhlcmUocGxhbmV0U2l6ZSk7bGV0IGw9Y29sb3IoMjU1LDEwMCw4MCwxMCk7Zm9yKGxldCByPTE7cjw9NTtyKyspZmlsbChsKSxzcGhlcmUoZ2xvd1NpemUrMipyKVx9fQ==";
        string memory attributes = string(
            abi.encodePacked(
                '"seed": "',
                planet.seed.toString(),
                '",',
                '"planetSize": "',
                planet.planetSize.toString(),
                '",',
                '"glowSize": "',
                planet.glowSize.toString(),
                '",',
                '"colors": ['
            )
        );

        for (uint256 i = 0; i < NUM_COLORS; i++) {
            attributes = string(
                abi.encodePacked(
                    attributes,
                    '"',
                    uint8ToString(planet.colors[i]),
                    '"',
                    i < NUM_COLORS - 1 ? "," : ""
                )
            );
        }
        attributes = string(abi.encodePacked(attributes, "],"));

        string memory thresholds = string(abi.encodePacked('"thresholds": ['));
        for (uint256 i = 0; i < NUM_THRESHOLDS; i++) {
            thresholds = string(
                abi.encodePacked(
                    thresholds,
                    '"',
                    planet.thresholds[i].toString(),
                    '"',
                    i < NUM_THRESHOLDS - 1 ? "," : ""
                )
            );
        }
        thresholds = string(abi.encodePacked(thresholds, "]"));

        string memory json = string(
            abi.encodePacked(
                "{",
                '"name": "Planet #',
                tokenId.toString(),
                '",',
                '"description": "A procedurally generated planet",',
                '"image_data": "',
                minifiedCode,
                '",',
                '"attributes": {',
                attributes,
                thresholds,
                "}",
                "}"
            )
        );
        string memory output = string(
            abi.encodePacked("data:application/json;charset=utf-8,", json)
        );

        return output;
    }

    function uint8ToString(uint8 _num) internal pure returns (string memory) {
        if (_num == 0) {
            return "0";
        }
        uint8 i = _num;
        uint8 j = _num;
        uint8 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory str = new bytes(length);
        while (i != 0) {
            str[--length] = bytes1(uint8(48 + (i % 10)));
            i /= 10;
        }
        return string(str);
    }
}
