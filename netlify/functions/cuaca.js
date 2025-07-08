export default async function handler(req, context) { // Parameter kedua adalah 'context', bukan 'res' di Netlify
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  const daftarKota = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Makassar', 'Denpasar'];

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

    // --- BAGIAN YANG DIUBAH (JAWABAN SUKSES) ---
    // Kita me-return objek, bukan memanggil res.status()
    return {
      statusCode: 200,
      headers: {
        'Cache-Control': 's-maxage=600, stale-while-revalidate'
      },
      // Body harus dalam bentuk string, jadi kita gunakan JSON.stringify()
      body: JSON.stringify(dataCuaca)
    };
    
  } catch (error) {
    console.error(error);
    // --- BAGIAN YANG DIUBAH (JAWABAN GAGAL) ---
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Terjadi kesalahan saat mengambil data cuaca', detail: error.message })
    };
  }
}
