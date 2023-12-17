pip3 install -r requirements.txt
pip3 install -e src/panorasdk/
python3 -m unittest discover -p "test*.py" 
