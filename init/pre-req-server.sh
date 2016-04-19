echo "**** Installing nodejs latest version 5.x ***"
sudo apt-get update
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash - sudo apt-get install -y nodejs
sudo apt-get install -y nodejs
sudo npm install pm2 -g
sudo apt-get install git

echo "**** Installing mongodb 3.x***"
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/debian wheezy/mongodb-org/3.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

echo "*** Installing latest Redis ***"
sudo apt-get install build-essential -y
wget http://download.redis.io/releases/redis-stable.tar.gz
tar xzf redis-stable.tar.gz
cd redis-stable
make
sudo apt-get install tcl8.5 -y
sudo make install
cd utils
sudo ./install_server.sh
echo "*** Installing nginx ***"
sudo apt-get install nginx
sudo ln -s /etc/nginx/sites-available/desavis /etc/nginx/sites-enabled/desavis
sudo cp nginx_conf/desavis /etc/nginx/sites-available/desavis
sudo ln -s /etc/nginx/sites-available/desavis /etc/nginx/sites-enabled/desavis