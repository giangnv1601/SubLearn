import axios from 'axios';
import Movie from '../models/Movie.js';

const BASE_URL = 'https://ophim1.com/v1/api/danh-sach';
const APP_DOMAIN_CDN = "https://img.ophim.live/uploads/movies/"

// Hàm gọi API lấy danh sách phim lẻ (au-my)
const getAllMovies = async (limit) => {
  try {
    const { data } = await axios.get(
      `${BASE_URL}/phim-le|phim-thuyet-minh?country=au-my&category=hanh-dong,vo-thuat,vien-tuong,phieu-luu,khoa-hoc&limit=${limit}`
    );

    // Lấy danh sách phim từ response
    const items = data?.data?.items ?? [];

    // Dùng Set để loại slug trùng lặp
    const slugSet = new Set(
      items
        .filter(movie => movie?.episode_current === 'Full' && movie?.slug)
        .map(movie => movie.slug)
    );

    console.log('Tổng số phim:', slugSet.size);

    // Trả về mảng slug duy nhất
    return Array.from(slugSet);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phim:', error);
    return [];
  }
};

// API lấy chi tiết phim theo slug
const getMovieDetails = async (slug) => {
  try {
    const { data } = await axios.get(
      `https://ophim1.com/v1/api/phim/${encodeURIComponent(slug)}`
    );

    const item = data?.data?.item;
    if (!item) {
      console.warn(`Không tìm thấy dữ liệu phim cho slug: ${slug}`);
      return null;
    }

    const movie = {
      title: item.name,
      slug: slug,
      originalTitle: item.origin_name,
      description: item.content,
      thumb_url: `${APP_DOMAIN_CDN}${item.thumb_url}`,
      poster_url: `${APP_DOMAIN_CDN}${item.poster_url}`,
      time: item.time,
      year: item.year,
      genre: item.category?.map(c => c.name).join(', ') ?? '',
      link_m3u8: item?.episodes?.[0]?.server_data?.[0]?.link_m3u8 ?? ''
    };

    // console.log('Chi tiết phim:', movie);
    return movie;
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết phim với slug "${slug}":`, error);
    return null;
  }
}

const importMoviesOnStartup = async () => {
  try {
    console.log('🚀 Bắt đầu nhập phim từ API ngoài...');
    const slugs = await getAllMovies(100);

    let added = 0;
    for (const slug of slugs) {
      const exists = await Movie.findOne({ slug });
      if (exists) continue;

      const movieData = await getMovieDetails(slug);
      if (movieData) {
        await Movie.create(movieData);
        added++;
      }
    }

    console.log(`Đã import ${added} phim mới vào CSDL`);
  } catch (error) {
    console.error('Lỗi khi import phim khi khởi động:', error);
  }
};

export { importMoviesOnStartup };