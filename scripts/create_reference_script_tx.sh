cardano-cli transaction build --babbage-era --testnet-magic 2 \
--tx-in 1078f6a508bde2344bc3bb369d3a0401035c87eb7cbfbc97a8cb3c1e20e843ea#1 \
--tx-in 1078f6a508bde2344bc3bb369d3a0401035c87eb7cbfbc97a8cb3c1e20e843ea#0 \
--tx-out addr_test1qr8drf5eur4emcrsanv6ppcf3pywzkzpx3pp2hhr273ddgl34r3hjynmsy2cxpc04a6dkqxcsr29qfl7v9cmrd5mm89q4t0cw0+50000000+"1 f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a.000de140707a636f6e74726163742e30303031" \
--tx-out-reference-script-file ../contract/contract.cbor \
--change-address addr_test1qr8drf5eur4emcrsanv6ppcf3pywzkzpx3pp2hhr273ddgl34r3hjynmsy2cxpc04a6dkqxcsr29qfl7v9cmrd5mm89q4t0cw0 \
--invalid-hereafter 25024243 \
--out-file tx.body