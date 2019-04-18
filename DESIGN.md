== Design notes

KothicJS use GeoJSON[1] as an internal data model.
geojson.bbox property is required

* As minimum external dependencies as possible
* Reentrancy in mind. User may setup renderer once and use it multiple times
* No-clutter approach. If some feature requires some pre-processing, it should be implemented outside the KothicJS core.
* Bulletproof

== Padding
Describe how tile edges are rendered

== Layers rendering order
TODO: Describe how the layers are sorted for rendering


1. What coordinate system is used for a tiles
2. How and when we do peproject to a screen coordinates

0. All coordinates are stored in [x, y] pair
1. All tiles are stored in memory in local coordinates. E.g. top? left? corner coordinates is always [0, 0] while right? bottom? corner is [tile_width, tile_height]

=== References
[1] RFC7946 https://tools.ietf.org/html/rfc7946
