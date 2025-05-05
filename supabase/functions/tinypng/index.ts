const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Handle multipart form data
    const formData = await req.formData();
    const imageFile = formData.get('image');
    const apiKey = formData.get('apiKey');

    if (!imageFile || !apiKey) {
      throw new Error('Missing required fields: image or apiKey');
    }

    if (!(imageFile instanceof File)) {
      throw new Error('Invalid image file');
    }

    const auth = `Basic ${btoa(`api:${apiKey}`)}`

    // Convert File to ArrayBuffer
    const fileData = new Uint8Array(await imageFile.arrayBuffer())

    const response = await fetch('https://api.tinify.com/shrink', {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/octet-stream',
      },
      body: fileData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to compress image')
    }

    const data = await response.json()
    const outputUrl = data.output.url
    
    if (!outputUrl) {
      throw new Error('No output URL received')
    }

    // Download the compressed image
    const outputResponse = await fetch(outputUrl, {
      headers: { 'Authorization': auth }
    })

    if (!outputResponse.ok) {
      throw new Error('Failed to download compressed image')
    }

    const compressedData = await outputResponse.blob()
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(await compressedData.arrayBuffer())))

    return new Response(
      JSON.stringify({
        data: `data:${data.output.type};base64,${base64Data}`,
        size: data.output.size
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})