export function useChunkedUpload() {
  const config = useRuntimeConfig()

  async function uploadFile(file: File) {
    const headers = useAuthHeaders()

    const init: any = await $fetch(`${config.public.apiBase}/upload/init`, {
      method: 'POST',
      headers,
      body: {
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      },
    })

    const uploadId = init.upload_id as string
    const chunkSize = Number(init.chunk_size)
    const totalParts = Math.ceil(file.size / chunkSize)

    for (let part = 0; part < totalParts; part++) {
      const start = part * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      const res = await fetch(`${config.public.apiBase}/upload/${uploadId}/parts/${part}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/octet-stream',
        },
        body: chunk,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Chunk upload failed at part ${part}: ${text}`)
      }
    }

    return await $fetch(`${config.public.apiBase}/upload/${uploadId}/complete`, {
      method: 'POST',
      headers,
      body: { total_parts: totalParts },
    }) as any
  }

  return { uploadFile }
}
