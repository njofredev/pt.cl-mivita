import streamlit as st
import re
from api import validar_rut_mivita
from db import init_db, log_consultation
from datetime import datetime

# Set page config
st.set_page_config(
    page_title="Validador Tarjeta Mi Vita",
    page_icon="💳",
    layout="centered"
)

# Refined UI to match reference perfectly
st.markdown("""
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

    <style>
    /* Global Background */
    .stApp {
        background-color: #f0f4ff !important;
        font-family: 'Inter', sans-serif;
    }
    
    [data-testid="stHeader"] {
        background: rgba(0,0,0,0);
    }

    /* Target the main container to look like the Navy card in the reference */
    [data-testid="stVerticalBlock"] > div:has(div.navy-section) {
        background-color: #121e42 !important;
        border-radius: 20px !important;
        padding: 40px !important;
        color: white !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important;
    }

    /* Headings */
    .accent-header {
        color: #00ff9d !important;
        font-weight: 700 !important;
        font-size: 2.2rem !important;
        margin-bottom: 0.5rem !important;
        text-align: center;
        line-height: 1.2;
    }
    
    .subtitle {
        color: #f0f0f0 !important;
        font-size: 1.1rem !important;
        margin-bottom: 2rem !important;
        text-align: center;
        opacity: 0.9;
    }

    /* Input Field Styling */
    .stTextInput input {
        border-radius: 12px !important;
        border: 2px solid #2e3b6e !important;
        padding: 12px 20px !important;
        height: 50px !important;
        font-size: 1.1rem !important;
        background-color: white !important;
        color: #121e42 !important;
        text-align: center !important;
    }
    
    .stTextInput input:focus {
        border-color: #00ff9d !important;
        box-shadow: 0 0 0 2px rgba(0, 255, 157, 0.2) !important;
    }

    /* Button Styling - Match "Paso" style from reference */
    .stButton>button {
        background-color: #121e42 !important;
        color: #00ff9d !important;
        border: 2px solid #00ff9d !important;
        padding: 10px 40px !important;
        border-radius: 25px !important;
        font-weight: 700 !important;
        font-size: 1.1rem !important;
        transition: all 0.3s ease !important;
        width: 100% !important;
        margin-top: 10px !important;
    }
    
    .stButton>button:hover {
        background-color: #00ff9d !important;
        color: #121e42 !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0, 255, 157, 0.3) !important;
    }

    /* Status Result Area */
    .status-container {
        margin-top: 2rem;
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        font-weight: 700;
        font-size: 1.25rem;
    }
    
    .status-vigente {
        border: 2px solid #00ff9d;
        color: #00ff9d;
    }
    
    .status-no-vigente {
        border: 2px solid #ff5252;
        color: #ff5252;
    }

    /* Footer */
    .custom-footer {
        text-align: center;
        color: #121e42;
        font-size: 1rem;
        margin-top: 4rem;
        padding: 20px;
        font-weight: 400;
        line-height: 1.6;
    }
    .custom-footer b {
        font-weight: 700;
    }
    </style>
""", unsafe_allow_html=True)

# Initialize DB on start
if 'db_initialized' not in st.session_state:
    st.session_state.db_initialized = init_db()

def format_rut(rut):
    # Remove any non-alphanumeric characters
    rut = re.sub(r'[^0-9kK]', '', rut)
    if len(rut) < 2:
        return rut
    cuerpo = rut[:-1]
    dv = rut[-1].upper()
    return f"{cuerpo}-{dv}"

def main():
    # Use a container to group everything that should be inside the Navy Card
    with st.container():
        # Tag for CSS targeting
        st.markdown('<div class="navy-section"></div>', unsafe_allow_html=True)
        
        st.markdown('<h1 class="accent-header">¿Tu tarjeta está vigente?</h1>', unsafe_allow_html=True)
        st.markdown('<p class="subtitle">Busca tu RUT y revisa tu estado de inmediato.</p>', unsafe_allow_html=True)
        
        # Centering the input and button
        col1, col2, col3 = st.columns([1, 6, 1])
        with col2:
            rut_input = st.text_input("INGRESA TU RUT", placeholder="Ej: 12345678-9", label_visibility="collapsed")
            st.markdown('<div style="height: 10px"></div>', unsafe_allow_html=True)
            consultar = st.button("Consultar Estado")

            if consultar:
                if not rut_input:
                    st.warning("⚠️ Por favor ingrese un RUT.")
                else:
                    rut_formatted = format_rut(rut_input)
                    with st.spinner('Validando...'):
                        success, estado, error_msg = validar_rut_mivita(rut_formatted)
                        
                        if success:
                            log_consultation(rut_formatted, estado)
                            if estado == "VIGENTE":
                                st.markdown(f'<div class="status-container status-vigente">✅ EL VECINO {rut_formatted} SE ENCUENTRA VIGENTE</div>', unsafe_allow_html=True)
                            else:
                                st.markdown(f'<div class="status-container status-no-vigente">❌ EL VECINO {rut_formatted} NO SE ENCUENTRA VIGENTE</div>', unsafe_allow_html=True)
                        else:
                            st.error(f"⚠️ Error: {error_msg}")
                            log_consultation(rut_formatted, f"ERROR: {error_msg}")

    # Separated Footer to match the structure of the reference
    st.markdown(f"""
        <div class="custom-footer">
            Si quieres continuar, <b>podrás reservar una hora para realizar tus exámenes.</b><br>
            <span style="opacity: 0.6; font-size: 0.85rem">© {datetime.now().year} Sistema de Validación Mi Vita</span>
        </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
