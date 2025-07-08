export default async function handler(req, context) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const daftarKota = ['Jakarta', 'Depok', 'Bandung', 'Surabaya', 'Medan', 'Makassar', 'Denpasar'];

  try {
    const requests = daftarKota.map(kota =>
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${kota}&appid=${apiKey}&units=metric&lang=id`)
        .then(response => {
          if (!response.ok) throw new Error(`Gagal fetch data untuk ${kota}`);
          return response.json();
        })
    );

    const results = await Promise.all(requests);

    const dataCuaca = results.map(data => ({
      kota: data.name,
      suhu: Math.round(data.main.temp),
      deskripsi: data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    }));

    return new Response(JSON.stringify(dataCuaca), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=600, stale-while-revalidate',
        // --- TAMBAHKAN BARIS INI ---
        'Access-Control-Allow-Origin': '*' // Mengizinkan semua domain mengakses API ini
      }
    });
    
  } catch (error) {
    console.error(error);
    
    return new Response(JSON.stringify({ message: 'Terjadi kesalahan saat mengambil data cuaca', detail: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        // --- TAMBAHKAN BARIS INI JUGA UNTUK ERROR ---
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
