# tag sundae-env
FROM consol/ubuntu-xfce-vnc

USER 0

RUN apt update
RUN apt install nodejs npm -y
RUN npm install n -g
RUN n latest

ADD ./capture /sundae/sundae-capture/


# RUN cd /sundae/sundae-capture/ && rm -rf node_modules

# USER 1000

RUN cd /sundae/sundae-capture/ && npm install

ADD ./sundae-vnc.sh /dockerstartup/
RUN chmod 777 /dockerstartup/sundae-vnc.sh
# ENTRYPOINT ["/dockerstartup/sundae-vnc.sh"]

USER 1000
