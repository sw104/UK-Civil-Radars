# UK Civil Radar Data

This repository collates some of the publicly available data about the civil
aviation radar sites (mostly run by NATS or NERL) in the UK.

## Files

The `nerl.csv` file contains data about sites which provide en-route radar
(mostly NERL sites).

The `aero.csv` file contains data about sites located at aerodromes which feed
the aerodrome ATC services (mostly NATS sites). Note that some aerodrome sites
also feed the en-route system.

The `sources.csv` file contains an index of the sources for the data in the
previous two CSV files.

## Sources

A copy of the sources used is saved in the `sources/` directory.

The source which information is taken from is indicated using a bracketed number
in the `nerl.csv` and `aero.csv` files. This number corresponds to an source
index in the `sources.csv` file.

Special indexes are given below:

* `(D)` - Data derived from other information.
* `(P)` - Data predicted based on what is likely from the other data. 


Most of the sources used are from wind farm planning documents.
