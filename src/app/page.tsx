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

  useEffect(() => {
    fetchMemos()
  }, [])

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
      alert('メモの追加に失敗しました。'+ error.message)
    }else{
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

  return (
    <main style={{ padding: '2rem' }}>
      <h1>メモアプリ</h1>
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
          {memo.content}
          <button onClick={() => deleteMemo(memo.id)} style={{ marginLeft: '1rem' }}>
          削除
          </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
