import { Routes, Route } from 'react-router'
import { DbProvider } from '@/lib/store'
import Layout from '@/components/Layout'
import CatalogPage from '@/pages/CatalogPage'
import ExhibitionPage from '@/pages/ExhibitionPage'
import ArtworkPage from '@/pages/ArtworkPage'
import AuthorPage from '@/pages/AuthorPage'
import OrganizerPage from '@/pages/OrganizerPage'
import LabelsPage from '@/pages/LabelsPage'
import TablePage from '@/pages/TablePage'

export default function App() {
  return (
    <DbProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/exhibitions/:exhibitionId" element={<ExhibitionPage />} />
          <Route path="/artworks/:artworkId" element={<ArtworkPage />} />
          <Route path="/author" element={<AuthorPage />} />
          <Route path="/organizer" element={<OrganizerPage />} />
        </Route>
        {/* Печатные формы — без обычной шапки сайта */}
        <Route path="/organizer/labels/:exhibitionId" element={<LabelsPage />} />
        <Route path="/organizer/table/:exhibitionId" element={<TablePage />} />
      </Routes>
    </DbProvider>
  )
}
