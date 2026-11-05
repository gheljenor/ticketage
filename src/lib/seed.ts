import type { Db } from './types'
import { artworkImage } from './images'

// Демонстрационные данные: несколько авторов, архив картин,
// действующая выставка с принятыми работами и выставка с открытым приёмом заявок.

export function buildSeed(): Db {
  const a1 = 'author-vera'
  const a2 = 'author-marat'
  const a3 = 'author-olga'
  const a4 = 'author-denis'

  const authors = [
    {
      id: a1,
      name: 'Вера Лебедева',
      bio: 'Живописец, работает в технике масляной живописи. Участница городских выставок с 2015 года.',
      email: 'vera.lebedeva@example.ru',
    },
    {
      id: a2,
      name: 'Марат Галеев',
      bio: 'Абстракционист, сочетает акрил и графику.',
      email: 'marat.galeev@example.ru',
    },
    {
      id: a3,
      name: 'Ольга Северова',
      bio: 'Акварелист, пленэрные зарисовки и городские пейзажи.',
      email: 'olga.severova@example.ru',
    },
    {
      id: a4,
      name: 'Денис Крамарь',
      bio: 'Смешанная техника, коллаж, ассамбляж.',
      email: 'denis.kramar@example.ru',
    },
  ]

  const ex1 = 'ex-light'
  const ex2 = 'ex-shores'

  const now = Date.now()
  const day = 86400000

  const exhibitions = [
    {
      id: ex1,
      title: 'Свет и ткань города',
      description:
        'Городской пейзаж и абстракция: как свет меняет фактуру улиц, окон и стен. Итоговая экспозиция кураторского отбора.',
      requirements:
        'Живопись, акварель, графика и смешанная техника. Размер по большей стороне — от 40 до 120 см. Работы должны быть оформлены в раму или на подрамнике с креплением. На обороте — этикетка с названием, автором и годом.',
      location: 'Выставочный зал «Пересветов переулок», Москва',
      startDate: iso(now - 20 * day),
      endDate: iso(now + 45 * day),
      deadline: iso(now + 10 * day),
      status: 'open' as const,
      createdAt: now - 60 * day,
    },
    {
      id: ex2,
      title: 'Тихие берега',
      description:
        'Камерная выставка о воде, береговой линии и тишине. Живопись, акварель, графика. Приём заявок открыт.',
      requirements:
        'Только камерные работы до 60 см по большей стороне. Техника: акварель, графика, пастель. Без рам со стеклом — только паспарту или подрамник. Не более трёх работ от одного автора.',
      location: 'Галерея «Арт-Набережная», Санкт-Петербург',
      startDate: iso(now + 78 * day),
      endDate: iso(now + 117 * day),
      deadline: iso(now + 41 * day),
      status: 'open' as const,
      createdAt: now - 15 * day,
    },
  ]

  const mk = (
    id: string,
    authorId: string,
    title: string,
    year: number,
    technique: string,
    height: number,
    width: number,
    description: string,
    createdAgo: number,
  ) => ({
    id,
    authorId,
    title,
    year,
    technique,
    height,
    width,
    description,
    image: artworkImage(id + title),
    createdAt: now - createdAgo * day,
  })

  const artworks = [
    mk('art-01', a1, 'Утро на Сретенке', 2024, 'холст, масло', 60, 80, 'Серия «Московские дворы». Утренний свет на старом фасаде.', 90),
    mk('art-02', a1, 'Окна напротив', 2025, 'холст, масло', 50, 70, 'Вечерний свет в окнах напротив, этюд.', 60),
    mk('art-03', a1, 'Трамвайное кольцо', 2023, 'картон, масло', 40, 55, 'Пленэрный этюд у трамвайного кольца.', 200),
    mk('art-04', a2, 'Конструкция № 7', 2025, 'холст, акрил', 100, 100, 'Из цикла геометрических композиций.', 45),
    mk('art-05', a2, 'Красный сдвиг', 2024, 'холст, акрил, маркер', 80, 120, 'Динамическая композиция на тёмном фоне.', 120),
    mk('art-06', a2, 'Сетка и пятно', 2022, 'бумага, графика, тушь', 42, 59, 'Графический лист, ручная печать.', 400),
    mk('art-07', a3, 'Нева перед грозой', 2025, 'бумага, акварель', 38, 56, 'Пленэр на Стрелке Васильевского острова.', 30),
    mk('art-08', a3, 'Крыши Петроградской', 2024, 'бумага, акварель', 30, 40, 'Вид с крыши мастерской.', 150),
    mk('art-09', a4, 'Переплёт', 2025, 'смешанная техника, коллаж', 70, 90, 'Коллаж из найденной бумаги и ткани.', 20),
    mk('art-10', a4, 'Архив улицы', 2023, 'смешанная техника, ассамбляж', 60, 60, 'Объектная композиция из городских находок.', 300),
    mk('art-11', a1, 'Синий час на бульваре', 2025, 'холст, масло', 70, 90, 'Бульвар в сумерках, густая синь и тёплые окна.', 26),
    mk('art-12', a1, 'Двор-колодец', 2022, 'картон, масло', 35, 50, 'Вид вверх из петербургского двора-колодца.', 500),
    mk('art-13', a2, 'Меридиан', 2025, 'холст, акрил', 90, 90, 'Вертикальная композиция из цикла «Координаты».', 18),
    mk('art-14', a2, 'Точка сборки', 2024, 'холст, акрил, пастель', 60, 80, 'Пятно и линия: поиск равновесия.', 80),
    mk('art-15', a3, 'Фонари на Мойке', 2025, 'бумага, акварель', 28, 38, 'Ночные фонари, отражения в воде канала.', 12),
    mk('art-16', a3, 'Лестница в Летний сад', 2024, 'бумага, акварель, белила', 36, 51, 'Утренний свет на гранитной лестнице.', 95),
    mk('art-17', a4, 'Городские слои', 2025, 'смешанная техника, коллаж', 80, 100, 'Наслоения афиш, найденных на улицах города.', 15),
    mk('art-18', a4, 'Билет в один конец', 2024, 'смешанная техника, ассамбляж', 50, 70, 'Композиция из транспортных билетов и карт.', 110),
  ]

  const app = (
    id: string,
    exhibitionId: string,
    artworkId: string,
    submittedAgo: number,
    status: 'pending' | 'approved' | 'rejected',
    comment?: string,
    received?: boolean,
  ) => ({
    id,
    exhibitionId,
    artworkId,
    submittedAt: now - submittedAgo * day,
    status,
    comment,
    received,
  })

  const applications = [
    app('apl-01', ex1, 'art-01', 35, 'approved', undefined, true),
    app('apl-02', ex1, 'art-02', 34, 'approved', undefined, true),
    app('apl-03', ex1, 'art-04', 30, 'approved', undefined, true),
    app('apl-04', ex1, 'art-05', 28, 'approved', undefined, true),
    app('apl-05', ex1, 'art-07', 25, 'approved', undefined, true),
    app('apl-06', ex1, 'art-09', 22, 'approved', undefined, true),
    app('apl-07', ex1, 'art-06', 20, 'rejected', 'Не соответствует тематике выставки.'),
    app('apl-08', ex1, 'art-08', 3, 'pending'),
    app('apl-09', ex2, 'art-03', 5, 'pending'),
    app('apl-10', ex2, 'art-08', 4, 'pending'),
    app('apl-11', ex2, 'art-10', 2, 'pending'),
    app('apl-12', ex1, 'art-11', 18, 'approved', undefined, true),
    app('apl-13', ex1, 'art-12', 17, 'approved', undefined, true),
    app('apl-14', ex1, 'art-13', 16, 'approved', undefined, true),
    app('apl-15', ex1, 'art-14', 14, 'approved'),
    app('apl-16', ex1, 'art-15', 12, 'approved'),
    app('apl-17', ex1, 'art-16', 10, 'approved'),
    app('apl-18', ex1, 'art-17', 8, 'approved'),
    app('apl-19', ex1, 'art-18', 6, 'approved'),
  ]

  return { authors, artworks, exhibitions, applications }
}

function iso(t: number): string {
  return new Date(t).toISOString().slice(0, 10)
}
