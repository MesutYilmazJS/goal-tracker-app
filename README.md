# Goal Tracker App - DEMO : https://mesutyilmazjs.github.io/goal-tracker-app/

Basit, hızlı ve görsel olarak düzenlenmiş bir hedef takip uygulaması. Kullanıcılar hedef ekleyebilir, kategorilere ayırabilir, tamamlanma durumunu takip edebilir ve ilerleme özetini tek ekranda görebilir.

## Özellikler

- Karanlık tema varsayılan olarak açılır.
- Hedef ekleme işlemi modal pencere üzerinden yapılır.
- Kategoriye göre filtreleme ve tarihe göre sıralama desteklenir.
- Özel kategori ekleme alanı vardır.
- Hedefler ve kategoriler `localStorage` içinde saklanır.
- Tamamlanan hedef sayısı, oranı ve en çok kullanılan kategori istatistik panelinde gösterilir.
- Mobil uyumlu yapı içerir.

## Kullanılan Teknolojiler

- HTML
- CSS
- JavaScript
- `localStorage`

## Dosya Yapısı

```text
goal-tracker-app/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Çalıştırma

Projeyi çalıştırmak için dosyaları doğrudan tarayıcıda açabilirsin. Daha sağlıklı bir kullanım için basit bir yerel sunucu önerilir:

```bash
python3 -m http.server 4173
```

Ardından tarayıcıda şu adresi aç:

```text
http://127.0.0.1:4173
```

## Kullanım

1. Sağdaki hedef listesini ve soldaki istatistik panelini görüntüle.
2. `Yeni Hedef Ekle` butonuna basarak modalı aç.
3. Hedef başlığı, tarih, öncelik ve kategori bilgilerini gir.
4. İstersen yeni bir kategori oluştur.
5. Hedefi ekledikten sonra kartlar listede görünür ve istatistikler otomatik güncellenir.

## Notlar

- Tema tercihi tarayıcıda saklanır.
- Hedefler yalnızca aynı tarayıcı ve cihaz üzerinde kayıtlı kalır.
- Veri tabanı veya sunucu bağlantısı yoktur.

## Geliştirme Fikirleri

- Kategori silme ve düzenleme
- Hedef düzenleme özelliği
- Sürükle-bırak sıralama
- Bildirim veya hatırlatıcı desteği
- Grafiklerle daha detaylı istatistik ekranı
