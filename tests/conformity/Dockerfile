FROM ubuntu:latest
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git 
RUN apt-get install -y xz-utils
WORKDIR /root/
RUN mkdir -m 0755 /nix && chown root /nix
RUN groupadd nixbld
RUN useradd -m -g nixbld nixbld
RUN usermod -a -G nixbld nixbld
RUN curl -L https://nixos.org/nix/install -o install-nixos.sh
RUN sh install-nixos.sh --no-daemon
RUN echo ". /root/.nix-profile/etc/profile.d/nix.sh" >> /root/.bashrc
RUN echo "PATH=\"${PATH}:/nix/store/azvn85cras6xv4z5j85fiy406f24r1q0-nix-2.18.1/bin/\"" >> /root/.bashrc
RUN git clone https://github.com/input-output-hk/plutus
WORKDIR /root/plutus
RUN git checkout release/1.10.0.0
RUN /nix/store/azvn85cras6xv4z5j85fiy406f24r1q0-nix-2.18.1/bin/nix --extra-experimental-features nix-command --extra-experimental-features flakes --accept-flake-config develop --command "ls"
RUN /nix/store/azvn85cras6xv4z5j85fiy406f24r1q0-nix-2.18.1/bin/nix --extra-experimental-features nix-command --extra-experimental-features flakes --accept-flake-config develop --command cabal list
RUN /nix/store/azvn85cras6xv4z5j85fiy406f24r1q0-nix-2.18.1/bin/nix --extra-experimental-features nix-command --extra-experimental-features flakes --accept-flake-config develop --command cabal update
RUN /nix/store/azvn85cras6xv4z5j85fiy406f24r1q0-nix-2.18.1/bin/nix --extra-experimental-features nix-command --extra-experimental-features flakes --accept-flake-config develop --command cabal run uplc dump-model
RUN echo "PATH=\"${PATH}:/root/plutus/dist-newstyle/build/x86_64-linux/ghc-9.2.7/plutus-core-1.10.0.0/x/uplc/build/uplc/\"" >> /root/.bashrc
RUN mkdir /root/test
WORKDIR /root/test
# $ docker build -t uplc-ref .
# $ docker run -v ./:/files -it uplc-ref bash