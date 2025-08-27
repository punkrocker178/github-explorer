sudo rm -rf /var/www/github-explorer/
sudo mkdir /var/www/github-explorer/

npm run build
sudo cp -r dist/* /var/www/github-explorer/