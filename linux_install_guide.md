# How to install on a GCP linux instance

## 1. Install some usual dependencies
```
sudo apt -y update
sudo apt -y upgrade
sudo apt -y install cmake pkg-config libssl-dev git build-essential clang libclang-dev curl ca-certificates gnupg lsb-release
```

## 2. Install nodejs and npm
```
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
sudo apt -y install nodejs
sudo npm install -g yarn
```
Check versions with 
```
node -v
npm -v
```
You need node >= 17


## 3. Install docker and docker-compose
Docker installation: https://docs.docker.com/engine/install/debian/
```
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get -y update
sudo apt-get -y install docker-ce docker-ce-cli containerd.io  
```

docker-compose installation: https://docs.docker.com/compose/install/
```
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 4. Git clone this repo
```
git clone https://github.com/randombishop/wika_etl
```


## 5. Install node modules, generate model classes, and build from typescript
```
cd wika_etl/subql_wika
yarn install
yarn codegen
yarn build
```

## 6. Modify docker-compose.yml
Change the passwords
Enable/disable plugins you need (see readme.md) for configuration options


## 7. Fill in starting block
Open `project.yml` and fill in the starting block
```
dataSources:
  - kind: substrate/Runtime
    startBlock: {some_recent_block_here}
```

## 8. Start the ETL services
Let's go!
```
nohup sudo /usr/local/bin/docker-compose up > docker-compose.log &
sudo chown -R 1000:1000 .data/es
```

## 9. Install and configure nginx

### Install
```
sudo apt-get install -y nginx
```

### Open the config file
```
sudo vi /etc/nginx/sites-enabled/default
```


### Add kibana proxy
```
server {

    listen 443;
    server_name es-test.wika.network;

    ssl_certificate           /path_to_your_x509;
    ssl_certificate_key       /path_to_your_key;

    ssl on;
    ssl_session_cache  builtin:1000  shared:SSL:10m;
    ssl_protocols  TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers HIGH:!aNULL:!eNULL:!EXPORT:!CAMELLIA:!DES:!MD5:!PSK:!RC4;
    ssl_prefer_server_ciphers on;

    access_log            /var/log/nginx/es.access.log;

    location / {

      proxy_set_header        Host $host;
      proxy_set_header        X-Real-IP $remote_addr;
      proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header        X-Forwarded-Proto $scheme;

      # Fix the “It appears that your reverse proxy set up is broken" error.
      proxy_pass          http://localhost:5601;
      proxy_read_timeout  90;

      proxy_redirect      http://localhost:5601 https://es-test.wika.network;
    }
  }
```

### Restart nginx
```
sudo sbin/service nginx restart
```
