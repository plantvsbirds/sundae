# tag sundae-main

FROM sundae-env
USER 0

ADD ./ /sundae/sundae-capture-new/
RUN rm -rf /sundae/sundae-capture-new/node_modules
RUN mv /sundae/sundae-capture/node_modules /sundae/sundae-capture-new
# warning! todo! diff yarn.lock/package.json to make sure no dep is changed
RUN rm -rf /sundae/sundae-capture/
RUN mv /sundae/sundae-capture-new/ /sundae/sundae-capture/

ENTRYPOINT ["/dockerstartup/sundae-vnc.sh"]

USER 1000