https://github.com/google-gemini/cookbook/blob/main/quickstarts/Caching.ipynb


Gemini API: Context Caching Quickstart


This notebook introduces context caching with the Gemini API and provides examples of interacting with the Apollo 11 transcript using the Python SDK. For a more comprehensive look, check out the caching guide.

Install dependencies

%pip install -q -U "google-genai>=1.0.0"
     
Configure your API key
To run the following cell, your API key must be stored it in a Colab Secret named GOOGLE_API_KEY. If you don't already have an API key, or you're not sure how to create a Colab Secret, see Authentication for an example.


from google.colab import userdata
from google import genai

GOOGLE_API_KEY = userdata.get('GOOGLE_API_KEY')
client = genai.Client(api_key=GOOGLE_API_KEY)
     
Upload a file
A common pattern with the Gemini API is to ask a number of questions of the same document. Context caching is designed to assist with this case, and can be more efficient by avoiding the need to pass the same tokens through the model for each new request.

This example will be based on the transcript from the Apollo 11 mission.

Start by downloading that transcript.


!wget -q https://storage.googleapis.com/generativeai-downloads/data/a11.txt
!head a11.txt
     
INTRODUCTION

This is the transcription of the Technical Air-to-Ground Voice Transmission (GOSS NET 1) from the Apollo 11 mission.

Communicators in the text may be identified according to the following list.

Spacecraft:
CDR	Commander	Neil A. Armstrong
CMP	Command module pilot   	Michael Collins
LMP	Lunar module pilot	Edwin E. ALdrin, Jr.
Now upload the transcript using the File API.


document = client.files.upload(file="a11.txt")
     
Cache the prompt
Next create a CachedContent object specifying the prompt you want to use, including the file and other fields you wish to cache. In this example the system_instruction has been set, and the document was provided in the prompt.

Note that caches are model specific. You cannot use a cache made with a different model as their tokenization might be slightly different.


# Note that caching requires a frozen model, e.g. one with a `-001` suffix.
MODEL_ID = "gemini-2.5-flash"  # @param ["gemini-2.0-flash-001", "gemini-2.5-flash", "gemini-2.5-pro"] {"allow-input":true, isTemplate: true}

apollo_cache = client.caches.create(
    model=MODEL_ID,
    config={
        'contents': [document],
        'system_instruction': 'You are an expert at analyzing transcripts.',
    },
)

apollo_cache
     
CachedContent(name='cachedContents/b687xokhkm3w2enfy4g0zgkncmq5niyzu8ial7o4', display_name='', model='models/gemini-2.5-flash', create_time=datetime.datetime(2025, 6, 17, 14, 17, 23, 456187, tzinfo=TzInfo(UTC)), update_time=datetime.datetime(2025, 6, 17, 14, 17, 23, 456187, tzinfo=TzInfo(UTC)), expire_time=datetime.datetime(2025, 6, 17, 15, 17, 22, 949829, tzinfo=TzInfo(UTC)), usage_metadata=CachedContentUsageMetadata(audio_duration_seconds=None, image_count=None, text_count=None, total_token_count=322698, video_duration_seconds=None))

from IPython.display import Markdown

display(Markdown(f"As you can see in the output, you just cached **{apollo_cache.usage_metadata.total_token_count}** tokens."))
     
As you can see in the output, you just cached 322698 tokens.

Manage the cache expiry
Once you have a CachedContent object, you can update the expiry time to keep it alive while you need it.


from google.genai import types

client.caches.update(
    name=apollo_cache.name,
    config=types.UpdateCachedContentConfig(ttl="7200s")  # 2 hours in seconds
)

apollo_cache = client.caches.get(name=apollo_cache.name) # Get the updated cache
apollo_cache
     
CachedContent(name='cachedContents/b687xokhkm3w2enfy4g0zgkncmq5niyzu8ial7o4', display_name='', model='models/gemini-2.5-flash', create_time=datetime.datetime(2025, 6, 17, 14, 17, 23, 456187, tzinfo=TzInfo(UTC)), update_time=datetime.datetime(2025, 6, 17, 14, 17, 23, 645000, tzinfo=TzInfo(UTC)), expire_time=datetime.datetime(2025, 6, 17, 16, 17, 23, 612197, tzinfo=TzInfo(UTC)), usage_metadata=CachedContentUsageMetadata(audio_duration_seconds=None, image_count=None, text_count=None, total_token_count=322698, video_duration_seconds=None))
Use the cache for generation
As the CachedContent object refers to a specific model and parameters, you must create a GenerativeModel using from_cached_content. Then, generate content as you would with a directly instantiated model object.


response = client.models.generate_content(
    model=MODEL_ID,
    contents='Find a lighthearted moment from this transcript',
    config=types.GenerateContentConfig(
        cached_content=apollo_cache.name,
    )
)

display(Markdown(response.text))
     
Here's a lighthearted moment from the transcript:

01 01 29 27 LMP: "Cecil B. deAldrin is standing by for instructions."

Why it's lighthearted:

Pun: Buzz Aldrin (LMP) makes a humorous pun on the name of famous Hollywood director Cecil B. DeMille, implying he's ready to direct the TV camera operations (as they were discussing setting up TV for transmission).
Breaks Technical Tone: It's a sudden, unexpected injection of personality and humor into what is otherwise a very formal and technical communication.
Relatability: It shows the human side of the astronauts, using wit and pop culture references to lighten the mood even in space.
You can inspect token usage through usage_metadata. Note that the cached prompt tokens are included in prompt_token_count, but excluded from the total_token_count.


response.usage_metadata
     
GenerateContentResponseUsageMetadata(cache_tokens_details=[ModalityTokenCount(modality=<MediaModality.TEXT: 'TEXT'>, token_count=322698)], cached_content_token_count=322698, candidates_token_count=164, candidates_tokens_details=None, prompt_token_count=322707, prompt_tokens_details=[ModalityTokenCount(modality=<MediaModality.TEXT: 'TEXT'>, token_count=322707)], thoughts_token_count=1919, tool_use_prompt_token_count=None, tool_use_prompt_tokens_details=None, total_token_count=324790, traffic_type=None)

display(Markdown(f"""
  As you can see in the `usage_metadata`, the token usage is split between:
  *  {response.usage_metadata.cached_content_token_count} tokens for the cache,
  *  {response.usage_metadata.prompt_token_count} tokens for the input (including the cache, so {response.usage_metadata.prompt_token_count - response.usage_metadata.cached_content_token_count} for the actual prompt),
  *  {response.usage_metadata.candidates_token_count} tokens for the output,
  *  {response.usage_metadata.total_token_count} tokens in total.
"""))
     
As you can see in the usage_metadata, the token usage is split between:

322698 tokens for the cache,
322707 tokens for the input (including the cache, so 9 for the actual prompt),
164 tokens for the output,
324790 tokens in total.
You can ask new questions of the model, and the cache is reused.


chat = client.chats.create(
  model=MODEL_ID,
  config={"cached_content": apollo_cache.name}
)

response = chat.send_message(message="Give me a quote from the most important part of the transcript.")
display(Markdown(response.text))
     
The most important part of this transcript, capturing the mission's ultimate objective and a pivotal moment in human history, is:

04 13 24 48 CDR (TRANQ) THAT'S ONE SMALL STEP FOR (A) MAN, ONE GIANT LEAP FOR MANKIND.


response = chat.send_message(
    message="What was recounted after that?",
    config={"cached_content": apollo_cache.name}
)
display(Markdown(response.text))
     
Immediately after that iconic statement, Neil Armstrong (CDR) recounted his initial observations and experiences on the lunar surface:

Surface Description: He noted that "the surface is fine and powdery," and that he could "pick it up loosely with my toe." He described it as adhering "in fine layers like powdered charcoal to the sole and sides of my boots," and that he only sank "a small fraction of an inch, maybe an eighth of an inch," but could clearly see his footprints and the treads.

Ease of Movement: He then commented on the locomotion, stating, "There seems to be no difficulty in moving around as we suspected. It's even perhaps easier than the simulations at one sixth g that we performed in the various simulations on the ground. It's actually no trouble to walk around."

Descent Engine Impact: He also observed the area beneath the Lunar Module's descent engine, remarking, "The descent engine did not leave a crater of any size. It has about 1 foot clearance on the ground. We're essentially on a very level place here. I can see some evidence of rays emanating from the descent engine, but a very insignificant amount."


response.usage_metadata
     
GenerateContentResponseUsageMetadata(cache_tokens_details=[ModalityTokenCount(modality=<MediaModality.TEXT: 'TEXT'>, token_count=322698)], cached_content_token_count=322698, candidates_token_count=252, candidates_tokens_details=None, prompt_token_count=322787, prompt_tokens_details=[ModalityTokenCount(modality=<MediaModality.TEXT: 'TEXT'>, token_count=322787)], thoughts_token_count=657, tool_use_prompt_token_count=None, tool_use_prompt_tokens_details=None, total_token_count=323696, traffic_type=None)

display(Markdown(f"""
  As you can see in the `usage_metadata`, the token usage is split between:
  *  {response.usage_metadata.cached_content_token_count} tokens for the cache,
  *  {response.usage_metadata.prompt_token_count} tokens for the input (including the cache, so {response.usage_metadata.prompt_token_count - response.usage_metadata.cached_content_token_count} for the actual prompt),
  *  {response.usage_metadata.candidates_token_count} tokens for the output,
  *  {response.usage_metadata.total_token_count} tokens in total.
"""))
     
As you can see in the usage_metadata, the token usage is split between:

322698 tokens for the cache,
322787 tokens for the input (including the cache, so 89 for the actual prompt),
252 tokens for the output,
323696 tokens in total.
Since the cached tokens are cheaper than the normal ones, it means this prompt was much cheaper that if you had not used caching. Check the pricing here for the up-to-date discount on cached tokens.

Delete the cache
The cache has a small recurring storage cost (cf. pricing) so by default it is only saved for an hour. In this case you even set it up for a shorter amont of time (using "ttl") of 2h.

Still, if you don't need you cache anymore, it is good practice to delete it proactively.


print(apollo_cache.name)
client.caches.delete(name=apollo_cache.name)
     
cachedContents/b687xokhkm3w2enfy4g0zgkncmq5niyzu8ial7o4
DeleteCachedContentResponse()
Next Steps
Useful API references:
If you want to know more about the caching API, you can check the full API specifications and the caching documentation.

Continue your discovery of the Gemini API
Check the File API notebook to know more about that API. The vision capabilities of the Gemini API are a good reason to use the File API and the caching. The Gemini API also has configurable safety settings that you might have to customize when dealing with big files


