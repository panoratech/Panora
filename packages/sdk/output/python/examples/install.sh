python -m venv .venv
source .venv/bin/activate
pip install build
python -m build --outdir dist ../ 
pip install dist/testsdk-1.0.0-py3-none-any.whl --force-reinstall
