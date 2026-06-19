import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGear, faArrowLeft, faFileCode, faToggleOn, faToggleOff,
  faPlus, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { useFormatProfileStore } from '../store/formatProfileStore';
import { useUIStore } from '../store/uiStore';

export function SettingsPage() {
  const navigate = useNavigate();
  const { profiles, toggleEnabled, deleteProfile } = useFormatProfileStore();
  const { addToast } = useUIStore();

  const handleDelete = async (id: string) => {
    try {
      await deleteProfile(id);
      addToast({ type: 'success', message: 'プロファイルを削除しました' });
    } catch (e) {
      addToast({ type: 'error', message: String(e) });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-surface-base dark:bg-dark-base">
      <header className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-card border-b border-surface-border dark:border-dark-border">
        <button onClick={() => navigate(-1)} className="p-1.5 text-ink-secondary hover:text-ink-primary transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <FontAwesomeIcon icon={faGear} className="text-primary-400" />
        <h1 className="font-semibold text-ink-primary">設定</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-8">
        {/* VCF Format Master */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFileCode} className="text-primary-400" />
              <h2 className="font-semibold text-ink-primary">VCF フォーマットマスター</h2>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              新規追加
            </button>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-xl border border-surface-border dark:border-dark-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border dark:border-dark-border bg-surface-base dark:bg-dark-base">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-placeholder uppercase tracking-wider">名前</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-placeholder uppercase tracking-wider hidden sm:table-cell">Ver</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-placeholder uppercase tracking-wider hidden md:table-cell">文字コード</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-placeholder uppercase tracking-wider">種別</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-ink-placeholder uppercase tracking-wider">状態</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50 dark:divide-dark-border/50">
                {profiles.map(profile => (
                  <tr key={profile.id} className="hover:bg-surface-card/50 dark:hover:bg-dark-card/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-primary text-sm">{profile.name}</div>
                      <div className="text-xs text-ink-placeholder truncate max-w-48">{profile.description}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-mono text-xs text-ink-secondary">{profile.version}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-mono text-xs text-ink-secondary">{profile.defaultEncoding}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-2xs font-medium ${profile.isBuiltin ? 'bg-primary-100 text-primary-700' : 'bg-sage-400/20 text-sage-600'}`}>
                        {profile.isBuiltin ? '内蔵' : 'カスタム'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleEnabled(profile.id)}
                        className={`transition-colors ${profile.enabled ? 'text-status-success' : 'text-ink-placeholder'}`}
                        title={profile.enabled ? '無効化' : '有効化'}
                      >
                        <FontAwesomeIcon icon={profile.enabled ? faToggleOn : faToggleOff} className="text-lg" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {!profile.isBuiltin && (
                        <button
                          onClick={() => handleDelete(profile.id)}
                          className="p-1 text-ink-placeholder hover:text-status-danger transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-2 text-xs text-ink-placeholder">
            フォーマットプロファイルを追加することで、新しい VCF 方言を拡張できます。
          </p>
        </section>
      </div>
    </div>
  );
}
