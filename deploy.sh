sudo rm -rf /var/www/github-explorer/
sudo mkdir /var/www/github-explorer/

git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/github-explorer/

# Restart backend service
sudo systemctl restart myscript.service