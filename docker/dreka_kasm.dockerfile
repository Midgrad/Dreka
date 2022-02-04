FROM nnhw/ubuntu:20.04
USER root

ENV DEBIAN_FRONTEND=noninteractive

ARG USERNAME=user
ARG PASSWORD=password
ARG USER_UID=1000
ARG USER_GID=$USER_UID

ENV HOME /home/kasm-user

# Create the user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -M -p $PASSWORD $USERNAME
    # echo $USERNAME:$PASSWORD | chpasswd


# Add sudo support.
RUN apt-get update \
    && apt-get install -y openssh-server \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

RUN ( \
    echo 'LogLevel DEBUG2'; \
    echo 'PermitRootLogin yes'; \
    echo 'PasswordAuthentication yes'; \
  ) > /etc/ssh/sshd_config.d/user.conf \
  && mkdir /run/sshd

RUN ( \
    echo '#!/bin/sh'; \
    echo 'sudo service ssh start'; \
  ) > /etc/X11/xinit/xinitrc.d/sshd.sh \
  && chmod +x /etc/X11/xinit/xinitrc.d/sshd.sh

EXPOSE 22/udp

# WORKDIR $HOME

# RUN apt update -qq  \
#     && apt install -y git \
#     && git clone https://github.com/Midgrad/Dreka.git  \
#     && cd Dreka \
#     && ./scripts/ubuntu_install_deps.sh \
#     && rm -rf /var/lib/apt/lists/*  \
#     && rm -rf /Dreka

RUN chown $USERNAME -R $HOME

USER 1000