export interface Author {
  id: string
  name: string
  bio?: string
  email?: string
  phone?: string
}

export interface Artwork {
  id: string
  authorId: string
  title: string
  year: number
  /** Материалы и техника, напр. «холст, масло» */
  technique: string
  /** Высота, см */
  height?: number
  /** Ширина, см */
  width?: number
  description?: string
  /** dataURL изображения */
  image?: string
  createdAt: number
}

export type ExhibitionStatus = 'draft' | 'open' | 'closed' | 'running' | 'finished'

export interface Exhibition {
  id: string
  title: string
  description?: string
  /** Требования к картинам: размер, техника, оформление и т.п. */
  requirements?: string
  location?: string
  /** даты проведения ISO yyyy-mm-dd */
  startDate: string
  endDate: string
  /** дедлайн приёма заявок */
  deadline: string
  status: ExhibitionStatus
  createdAt: number
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface Application {
  id: string
  exhibitionId: string
  artworkId: string
  submittedAt: number
  status: ApplicationStatus
  /** комментарий модератора */
  comment?: string
  /** картина физически передана на выставку */
  received?: boolean
}

export interface Db {
  authors: Author[]
  artworks: Artwork[]
  exhibitions: Exhibition[]
  applications: Application[]
}

export const EXHIBITION_STATUS_LABELS: Record<ExhibitionStatus, string> = {
  draft: 'Черновик',
  open: 'Приём заявок',
  closed: 'Приём завершён',
  running: 'Открыта',
  finished: 'Закрыта',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'На рассмотрении',
  approved: 'Принята',
  rejected: 'Отклонена',
}
