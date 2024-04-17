LiteCash OPEN SOURCE POOL GUIDE

(With credit to Greg of Icemining Pools for his excellent efforts in building the stratum and pool, Lolliedieb for the Beamhashverify to enable this pool to switch between BeamHashI, BeamHashII and BeamHashIII and also to VSnation for the magically unique BASiC payment processor)

Open Source LiteCash Pool Software w/ Guide

By installing the pool software and BASiC Payment processor from this guide, you fully agree to this following disclaimer:

DISCLAIMER: This LiteCash open source pool software comes with no warranty and it is the sole responsibility of the user to ensure the functions and design of their own deployment, meet the required standards which a cryptocurrency miner would expect to see in a mining pool. Where the code is complete in-as-much as the pool stratum, API and a barebones deployment of the GUI is functional and working, it is also the responsibility of the user to ensure that they have adept knowledge in pool systems. This code is offered freely under MIT licencing and the authors, host and publishers will hold no responsibility, nor support for installation or troubleshooting.

The pool software is also now offered with Beam’s BASiC rewards distribution function and this part is contained in accompanying repository, with it’s own README file and same disclaimer above applies.


To begin compiling the LiteCash open source pool software, you will need to find a suitable VPS (Virtual Private Server) from a respectable hosting company. 

Once you have found a VPS, please log in and you can start to set up the pool.

Firstly update your server.

	sudo apt update

	sudo apt upgrade
Next, install the required dependencies to build and run the pool

	sudo apt install python-dev build-essential libsodium-dev npm libboost-all-dev libboost-dev
You will also need to install NODEJS 10.x and MYSQL, separately from the above dependencies

	sudo apt install curl

	curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -

	sudo apt-get install -y nodejs

	sudo apt install -y mysql-server
Update & Upgrade again just to make sure all these are current releases.

	sudo apt-get update

	sudo apt-get upgrade
Next, install REDIS SERVER

	sudo apt-get install redis-server
and enable the REDIS service

	sudo systemctl enable redis-server.service
This will then require a server reboot…

	sudo reboot now
Once reboot is complete, log into your server again as root and install php-redis

	sudo apt-get install php-redis
You are now ready to clone the repository which holds all the pool code!

	git clone https://github.com/Litecash-Dev/cash-mine.git
Go into the beam-pool folder and make sure it’s up to date.

	cd beam-mine

	npm update

	npm install
Now you need to configure your MYSQL Db’s

	cd /etc/mysql/mysql.conf.d/

	nano /etc/mysql/mysql.conf.d/mysqld.cnf
and edit the line as shown:

	bind-address            = 0.0.0.0
save the file.

You will now want to build the LiteCash node and Wallet which will link to the pool stratum, and amend your config files.

	cd

	mkdir beam-node

	cd beam-node

	These files contain all the Linux executables (wallet, wallet-api, explorer-node, litecash-node)
	x86 - wget https://github.com/Litecash-Dev/litecash/releases/download/2.5.96/Litecash_Linux_x86_64-CLI-2.5.96.tar.gz (litecash-node executable)
	x86_64 - wget https://github.com/Litecash-Dev/litecash/releases/download/2.5.96/Litecash_Linux_x86_64-CLI-2.5.96.tar.gz (litecash-node executable)

	tar -xvf Litecash_Linux_ARCH_VER.tar.gz
	
Make a subfolder named stratum_secrets

	mkdir stratum_secrets

	cd stratum_secrets

You will need to now generate a set of ssl key/certificate for your pool, to do this run the following command

	openssl req -x509 -newkey rsa:4096 -keyout litecash-stratum-key.pem -out litecash-stratum-crt.pem -days 3650 -nodes -subj '/CN=localhost’

Now rename the two files created in this process using.

	mv litecash-stratum-key.pem stratum.key
	mv litecash-stratum-crt.pem stratum.crt

You will now have one file stratum.key and one file stratum.crt in this folder. Go back up a level

	cd ..

Next step will be to choose a password for the wallet and add it to your litecash-wallet.cfg file. Open the litecash-wallet.cfg file using a text editor

	nano litecash-wallet.cfg

and put your password at the command line:

	pass=YOURPASSWORD

Uncomment the line by removing the single # sign.

Also amend there:

	node_addr=127.0.0.1:10127

Again, uncomment this line by removing the single # sign. Those are the only 2 configurations that must be done on litecash-wallet.cfg Save the file and close it.

You can now initiate your Beam Pool wallet

	./litecash-wallet init

Save the output info in a safe place. This is your seed phrase and wallet default address, into which all mined coins from the pool, will be stored prior to distribution to your miners

You will also want to set that default address to never expire

	./litecash-wallet change_address_expiration --address=YOURDEFAULTWALLETADDRESS --expiration_time=never

Next you will need two keys to configure them the node. Please run the following command

	./litecash-wallet export_miner_key --subkey=1

	./litecash-wallet export_owner_key
Take the keys and put in the beam-node.cfg on the lines

	owner_key=
&

	miner_key=

Uncomment the line by removing the single # signs on each line. Now edit #password for keys in litecash-node.cfg so that it matches #password for the wallet in litecash-wallet.cfg – this is the password that you created previously.

	pass=YOURPASSWORD

Whilst still within a text editor in litecash-node.cfg, locate each of the below lines and amend;

	port=10127
	log_level=verbose
	file_log_level=verbose
	peer=ca1.lite-cash.com:10000,explorer.lite-cash.com:10000,gibs.cash:10000
	peers_persistent=1
	stratum_port=3333
	stratum_secrets_path=./stratum_secrets/

Open a new command line window which you are prepared to leave open (or screen -dmS it) all the time – this command window will contain the perpetual node connection. It is imperative that this process is never stopped. Navigate into your beam-node folder and start the node by typing;

	./litecash-node
Whilst allowing the node to synchronise and depending on your device firewall settings, you may need to “allow” it to open all the ports required to run the pool. Have a separate terminal window open for extra commands (these are all the hard-coded ports which the pool will utilise)

	sudo ufw allow 10127
	sudo ufw allow 8010
	sudo ufw allow 80
	sudo ufw allow 1690
	sudo ufw allow 3333
	sudo ufw allow 6379
	sudo ufw allow 6543
	sudo ufw allow 3306
	sudo ufw allow 666

Let the node synchronise with the network by downloading the Beam blockchain. This may take a while, depending on your connection speed. Once fully synchronised, you will see your LiteCash node collect the most up to date block height. Compare the node height with https://explorer.lite-cash.com/ and ensure it matches before continuing. The % will also show 100% in the node printout.

Once the node is fully synchronised, use a command line window which you are prepared to leave open all the time (or screen -dmS it). Navigate within the command line to your litecash-node folder and type:

	./litecash-wallet listen

This enables the LiteCash pool wallet to perpetually listen at the LiteCash node. Now let’s move onto your MYSQL database setup. Use an third-party software (such as sequelpro) to manage your schema tables. You will also need to create a MYSQL USER outside of ROOT to manage your Beam database (which we will create as follows…)

	mysql -u root

	CREATE USER 'newMYSQLuser'@'localhost' IDENTIFIED BY 'MYSQLpassword';

	GRANT ALL PRIVILEGES ON *.* TO 'newMYSQLuser'@'localhost';

	FLUSH PRIVILEGES;

And confirm your new user has privileges

	SHOW GRANTS FOR 'database_user'@'localhost';

Now in your MYSQL third party software (sequelpro or similar) create your tables within a new database ‘beam’

	CREATE TABLE `accounts` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `coinid` int(11) DEFAULT NULL,
	  `username` varchar(96) DEFAULT NULL,
	  `ip` varchar(96) DEFAULT NULL,
	  PRIMARY KEY (`id`)
	) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

	CREATE TABLE `blocks` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `coinid` int(11) DEFAULT NULL,
	 `time` int(18) DEFAULT NULL,
	  `userid` int(11) DEFAULT NULL,
	  `workerid` int(11) DEFAULT NULL,
	  `height` int(11) DEFAULT NULL,
	  `paid` tinyint(1) DEFAULT NULL,
	  `paid_at` int(96) DEFAULT NULL,
	  `sharediff` float DEFAULT NULL,
	  `blockdiff` float DEFAULT NULL,
	  `confirmations` float DEFAULT NULL,
	  `difficulty` float DEFAULT NULL,
	  `blockhash` varchar(64) DEFAULT NULL,
	  `reward` float DEFAULT NULL,
	  `category` varchar(32) DEFAULT NULL,
	  `jobid` int(11) DEFAULT NULL,
	  PRIMARY KEY (`id`)
	) ENGINE=InnoDB AUTO_INCREMENT=202 DEFAULT CHARSET=utf8mb4;

	CREATE TABLE `shares` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `coinid` int(11) DEFAULT NULL,
	  `userid` int(11) DEFAULT NULL,
	  `blockhash` varchar(64) DEFAULT NULL,
	  `height` int(11) DEFAULT NULL,
	  `difficulty` double DEFAULT NULL,
	  `sharediff` double DEFAULT NULL,
	  `workerid` int(96) DEFAULT NULL,
	 `time` int(18) DEFAULT NULL,
	  PRIMARY KEY (`id`)
	) ENGINE=InnoDB AUTO_INCREMENT=2000 DEFAULT CHARSET=utf8mb4;

	CREATE TABLE `workers` (
	  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
	  `userid` int(11) DEFAULT NULL,
	  `ip` varchar(96) DEFAULT NULL,
	  `name` varchar(96) DEFAULT NULL,
	  `difficulty` int(11) DEFAULT NULL,
	  `rigname` varchar(32) DEFAULT NULL,
	 `time` int(18) DEFAULT NULL,
	  PRIMARY KEY (`id`)
	) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4;

EDIT YOUR CONFIGURATION FILES

LOCATION: litecash-mine/config.json

should be amended in the REDIS sections

	    "redis": {
	    "host": "127.0.0.1",
	    "port": 6379,
	    "password": ""

and in the website section, to reflect the IP of the VPS upon which you are installing the pool (the below example is Raskul Beam Pool, please use your own IP, and port remains 8010).

	    "website": {
	    "enabled": true,
	    "host": "94.130.104.164",
	    "port": 8010,
	    "stratumHost": "94.130.104.164",
	    "stats": {
LOCATION litecash-mine/pool_configs/beam.json amend to specify the path to your stratum.key and stratum.crt

	 },
	 "tlsOptions": {
	 "enabled": true,
	 "serverKey": "../stratum_secrets/stratum.key",
	 "serverCert": "../stratum_secrets/stratum.crt",
	 "ca": ""

and in the MYSQL section (mposMode section) this should reflect the newMYSQLuser and MYSQLpassword you created earlier

	    },
	    "mposMode": {
	    "enabled": true,
	    "host": "127.0.0.1",
	    "port": 3306,
	    "user": "newMYSQLuser",
	    "password": "MYSQLpassword",
	    "database": "liteash",
	    "checkPassword": false,
	    "autoCreateWorker": true
	    }

LOCATION litecash-mine/libs/beam-blockconf.js amend const=api and the MYSQL pieces

	 const coinid = 2423;
	 const coin_symbol = 'BEAM';
	 const confirmations = 240;
	 const api = 'http://127.0.0.1:666';
	 module.exports = async function() {
	 const connection = await mysql.createConnection({
	 host: '127.0.0.1',
	 user: 'newMYSQLuser',
	 password: 'MYSQLpassword',
	 database: 'beam',

LOCATION litecash-mine/libs/stats.js amend the MYSQLconnection here;

	 async function setupMysqlConnection() {
	 this.connection = await mysql.createConnection({
	 host: '127.0.0.1',
	 user: 'newMYSQLuser',
	 password: 'MYSQLpassword',
	 database: 'beam',

The below examples start the applications using a screen session. You may want to use systemd and create a unit file to start the applications automatically on boot. 

INSTALL THE WALLET-API

The wallet API is included in your previously download package (wallet-api).


Amend the configuration file within this folder as follows

	nano wallet-api.cfg 

Amend the password to match your owner key password

	pass=yourpassword

node address to listen the api server on

	node_addr=127.0.0.1:101274

port to start server on

	port=11111

use JSON RPC over http

	use_http=1

INSTALL THE EXPLORER-NODE (API)

The explorer node is included in your previously download package (explorer-node).

And amend the configuration file within this folder as follows

	nano explorer-node.cfg 

Peer address to point the local api server to

peer address

	peer=YOUR SERVER IP:PORT

port to start the local api server on

	api_port=666

owner key from node setup steps

	key_owner=YOUR_OWNER_KEY_FROM_NODE_CONFIGURATION

password for owner key

	pass=YOUR_PASSWORD_FROM_NODE_CONFIGURATION

TIME TO GET IT ALL RUNNING!

Give your server a quick reboot

	sudo reboot now

Once powered up and logged in, make sure you have your node 100% synch and screen it, buy going into beam-node folder and using the following command:

	screen -dmS NODE ./litecash-node

Navigate into your litecash-explorer folder and run the API using. the following command:

	screen -dmS EXPLORER ./explorer-node

Run the wallet API (and enable offline payments):

	screen -dmS API ./wallet-api

Set up your wallet listener from within the litecash-node folder:

	screen -dmS LISTEN ./litecash-wallet listen -n YOURSERVERIP:10127

RUN THE POOL

From within the litecash-pool folder, run the command as follows;

	screen -dmS POOL node init.js 

Your (very basic) pool GUI will then be publicly accessible from

http://YOUR_POOL_IP:8010

If you wish to utilise it, you can now set up the BASiC Payment Processor from https://github.com/r45ku1/basic

All code released with no warranty and no support assistance. 



