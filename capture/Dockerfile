FROM sundae-env
USER 0

ADD ./ /sundae/sundae-capture-new/
RUN rm -rf /sundae/sundae-capture-new/node_modules
RUN mv /sundae/sundae-capture/node_modules /sundae/sundae-capture-new
RUN rm -rf /sundae/sundae-capture/
RUN mv /sundae/sundae-capture-new/ /sundae/sundae-capture/

#, "/sundae/start.sh"]
USER 1000