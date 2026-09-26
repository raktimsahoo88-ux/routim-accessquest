'use client';
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f4f0e7',color:'#17263c'}}><section style={{maxWidth:560,background:'#fff',border:'1px solid #ded8cd',borderRadius:24,padding:32,boxShadow:'0 20px 60px rgba(23,38,60,.08)'}}><p style={{fontWeight:800,letterSpacing:'.08em'}}>ROUTIM · RECOVERY</p><h1>Something interrupted this screen.</h1><p>The demo data in your browser is preserved. Try the screen again before resetting anything.</p><button onClick={reset} style={{padding:'12px 18px',borderRadius:12,border:0,background:'#0b7c76',color:'#fff',fontWeight:800}}>Try again</button></section></main>;
}
