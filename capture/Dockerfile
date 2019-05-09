FROM consol/centos-xfce-vnc

# todo: copy electron
ADD ./docker /sundae

ENTRYPOINT ["/dockerstartup/vnc_startup.sh", "/sundae/start.sh"]