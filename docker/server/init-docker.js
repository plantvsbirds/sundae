const Dockerode = require('dockerode')
const docker = new Dockerode()

docker.createNetwork({
    Name: 'sundae-network',
    CheckDuplicate: true,
    Internal: false,
    IPAM: {
        Config: [
            {
                "Subnet": "172.20.0.0/16",
                "IPRange": "172.20.10.0/24",
                "Gateway": "172.20.10.11"
            },
        ]
    }
}).catch((e) => {
    console.log("sundae-network init fail, probably exists already?")
})