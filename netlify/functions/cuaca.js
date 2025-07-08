export default async function handler(req, res) {
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

    // Atur header untuk caching di sisi browser selama 10 menit
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json(dataCuaca);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data cuaca' });
  }
}