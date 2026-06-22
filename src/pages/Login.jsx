import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      navigate('/admin'); // Redirige al panel tras loguear
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <form onSubmit={handleLogin} className="bg-[#181818] p-8 rounded-2xl border border-[#2a2a2a] w-full max-w-sm shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#e6dcc8]">ACCESO ADMINISTRADOR</h2>
        
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="CORREO" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0d0d0d] p-3 rounded-lg border border-[#2a2a2a] outline-none focus:border-[#e6dcc8] text-white" 
            required
          />
          <input 
            type="password" 
            placeholder="CONTRASEÑA" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0d0d0d] p-3 rounded-lg border border-[#2a2a2a] outline-none focus:border-[#e6dcc8] text-white" 
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2D3025] text-[#e6dcc8] font-bold py-3 rounded-lg hover:bg-[#3a3d32] transition"
          >
            {loading ? "INGRESANDO..." : "ENTRAR"}
          </button>
        </div>
      </form>
    </div>
  );
}