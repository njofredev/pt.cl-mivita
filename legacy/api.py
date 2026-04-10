import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://m30gs3t5a0.execute-api.us-west-2.amazonaws.com/wsmivita/prod/validar"
API_KEY = os.getenv("MI_VITA_API_KEY", "test")
SECRET = os.getenv("MI_VITA_SECRET", "test")

def validar_rut_mivita(rut: str):
    """
    Validates a RUT against the Mi Vita API.
    RUT should be in the format '12345678-9'
    """
    params = {
        "apikey": API_KEY,
        "secret": SECRET,
        "rut": rut
    }
    
    try:
        response = requests.get(API_URL, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            # Success response: {"status": {"estado": "VIGENTE"}} or {"status": {"estado": "NO_VIGENTE"}}
            return True, data.get("status", {}).get("estado", "UNKNOWN"), None
        elif response.status_code == 400:
            return False, None, "INVALID_PARAMETERS"
        elif response.status_code == 401:
            # Could be INVALID_CREDENTIALS or VECINO_NO_EXISTE
            try:
                msg = response.json().get("status", {}).get("message", "UNAUTHORIZED")
                return False, None, msg
            except:
                return False, None, "UNAUTHORIZED"
        else:
            return False, None, f"HTTP Error {response.status_code}"
            
    except requests.exceptions.RequestException as e:
        return False, None, f"Connection Error: {str(e)}"
