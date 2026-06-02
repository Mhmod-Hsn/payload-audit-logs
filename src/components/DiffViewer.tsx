'use client'

import React, { useState, useMemo } from 'react'
import { useAllFormFields } from '@payloadcms/ui'
import './DiffViewer.css'

interface DiffItem {
  key: string
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  oldValue: any
  newValue: any
}

function parseJSON(val: any): any {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val)
    } catch {
      return val
    }
  }
  return val
}

function isEmpty(val: any): boolean {
  if (val === undefined || val === null) return true
  if (typeof val === 'string' && val.trim() === '') return true
  if (Array.isArray(val) && val.length === 0) return true
  if (typeof val === 'object' && Object.keys(val).length === 0) return true
  return false
}

function deepDiff(oldVal: any, newVal: any, path = ''): DiffItem[] {
  const oldEmpty = isEmpty(oldVal)
  const newEmpty = isEmpty(newVal)

  if (oldEmpty && newEmpty) {
    return [{ key: path, type: 'unchanged', oldValue: oldVal, newValue: newVal }]
  }

  if (oldEmpty && !newEmpty) {
    return [{ key: path, type: 'added', oldValue: oldVal, newValue: newVal }]
  }

  if (!oldEmpty && newEmpty) {
    return [{ key: path, type: 'removed', oldValue: oldVal, newValue: newVal }]
  }

  // If both are not empty and equal
  if (oldVal === newVal || JSON.stringify(oldVal) === JSON.stringify(newVal)) {
    return [{ key: path, type: 'unchanged', oldValue: oldVal, newValue: newVal }]
  }

  // If both are objects and not arrays
  if (
    typeof oldVal === 'object' &&
    typeof newVal === 'object' &&
    !Array.isArray(oldVal) &&
    !Array.isArray(newVal)
  ) {
    const oldKeys = Object.keys(oldVal)
    const newKeys = Object.keys(newVal)
    const allKeys = Array.from(new Set([...oldKeys, ...newKeys]))

    const diffs: DiffItem[] = []
    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key
      diffs.push(...deepDiff(oldVal[key], newVal[key], currentPath))
    }
    return diffs
  }

  return [{ key: path, type: 'modified', oldValue: oldVal, newValue: newVal }]
}

function formatValue(value: any): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function DiffViewer() {
  const [fields] = useAllFormFields()
  const [showUnchanged, setShowUnchanged] = useState(false)

  const originalData = useMemo(() => {
    const raw = fields?.originalData?.value
    return parseJSON(raw)
  }, [fields?.originalData?.value])

  const newData = useMemo(() => {
    const raw = fields?.newData?.value
    return parseJSON(raw)
  }, [fields?.newData?.value])

  const diffItems = useMemo(() => {
    if (!originalData && !newData) return []
    // Filter out top-level id, createdAt, updatedAt, etc. if desired, but general diff is preferred
    const computed = deepDiff(originalData || {}, newData || {})
    // Filter out root empty key if any
    return computed.filter(item => item.key !== '')
  }, [originalData, newData])

  const { changedItems, unchangedCount } = useMemo(() => {
    const changed = diffItems.filter(item => item.type !== 'unchanged')
    const unchanged = diffItems.filter(item => item.type === 'unchanged')
    return {
      changedItems: changed,
      unchangedCount: unchanged.length,
    }
  }, [diffItems])

  const visibleItems = showUnchanged ? diffItems : changedItems

  if (diffItems.length === 0) {
    return (
      <div className="diff-viewer-empty">
        No differences found or data is empty.
      </div>
    )
  }

  return (
    <div className="diff-viewer-container">
      <div className="diff-viewer-header">
        <h4 className="diff-viewer-title">Data Differences</h4>
        {unchangedCount > 0 && (
          <button
            type="button"
            className="diff-viewer-toggle-btn"
            onClick={() => setShowUnchanged(!showUnchanged)}
          >
            {showUnchanged ? 'Hide Unchanged Fields' : `Show Unchanged Fields (${unchangedCount})`}
          </button>
        )}
      </div>

      <div className="diff-viewer-content">
        {visibleItems.map((item) => (
          <div key={item.key} className={`diff-item diff-item-${item.type}`}>
            <div className="diff-item-path">
              <code>{item.key}</code>
              <span className={`diff-item-badge diff-item-badge-${item.type}`}>
                {item.type}
              </span>
            </div>
            <div className="diff-item-lines">
              {item.type !== 'added' && item.type !== 'unchanged' && (
                <div className="diff-line diff-line-removed">
                  <span className="diff-line-marker">-</span>
                  <pre className="diff-line-content">
                    <code>{formatValue(item.oldValue)}</code>
                  </pre>
                </div>
              )}
              {item.type !== 'removed' && item.type !== 'unchanged' && (
                <div className="diff-line diff-line-added">
                  <span className="diff-line-marker">+</span>
                  <pre className="diff-line-content">
                    <code>{formatValue(item.newValue)}</code>
                  </pre>
                </div>
              )}
              {item.type === 'unchanged' && (
                <div className="diff-line diff-line-unchanged">
                  <span className="diff-line-marker">&nbsp;</span>
                  <pre className="diff-line-content">
                    <code>{formatValue(item.newValue)}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
