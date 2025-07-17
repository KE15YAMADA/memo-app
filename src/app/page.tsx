
'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '../lib/supabaseClient'

const supabase = createSupabaseClient()

type Memo = {
  id: string
  content: string
  created_at: string
}

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([])
  const [newMemo, setNewMemo] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchMemos()
    }
  }, [user])

  const fetchMemos = async () => {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setMemos(data)
  }

  const addMemo = async () => {
    if (!newMemo.trim()) return
    const { error } = await supabase.from('memos').insert([{ content: newMemo }])
    if (error) {
      console.error('メモの追加に失敗しました:', error.message)
      alert('メモの追加に失敗しました。' + error.message)
    } else {
      setNewMemo('')
      fetchMemos()
    }
  }

  const deleteMemo = async (id: string) => {
    const { error } = await supabase.from('memos').delete().eq('id', id)
    if (error) {
      console.error('Delete error:', error.message)
      alert('削除に失敗しました: ' + error.message)
    } else {
      fetchMemos()
    }
  }

  const startEditing = (id: string, currentContent: string) => {
    setEditingId(id)
    setEditContent(currentContent)
  }

  const saveEdit = async () => {
    if (!editingId) return
    const { error } = await supabase
      .from('memos')
      .update({ content: editContent })
      .eq('id', editingId)
    if (error) {
      console.error('Edit error:', error.message)
      alert('編集に失敗しました: ' + error.message)
    } else {
      setEditingId(null)
      setEditContent('')
      fetchMemos()
    }
  }

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert('サインアップ失敗: ' + error.message)
    else alert('確認メールを送信しました。')
  }

  const signIn = async () => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert('ログイン失敗: ' + error.message)
    else setUser(data.user)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMemos([])
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>メモアプリ</h1>

      {!user ? (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
          />
          <button onClick={signUp}>サインアップ</button>
          <button onClick={signIn}>ログイン</button>
        </>
      ) : (
        <>
          <button onClick={signOut}>ログアウト</button>
          <input
            type="text"
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
            placeholder="メモを入力"
          />
          <button onClick={addMemo}>追加</button>
          <ul>
            {memos.map((memo) => (
              <li key={memo.id}>
                {editingId === memo.id ? (
                  <>
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <button onClick={saveEdit}>保存</button>
                    <button onClick={() => setEditingId(null)}>キャンセル</button>
                  </>
                ) : (
                  <>
                    {memo.content}
                    <button onClick={() => deleteMemo(memo.id)} style={{ marginLeft: '1rem' }}>
                      削除
                    </button>
                    <button onClick={() => startEditing(memo.id, memo.content)} style={{ marginLeft: '0.5rem' }}>
                      編集
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
