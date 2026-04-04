https://github.com/google-gemini/cookbook/tree/main/examples


Gemini API Examples
This folder contains a collection of examples for the Gemini API. These are advanced examples and might be quite complex as they often use one of more Gemini capabilities.

For introductions to those features it is recommended to start with the Quickstarts guides, and the Get started one in particular.


Table of contents
This is a collection of fun and helpful examples for the Gemini API.

Cookbook	Description	Features	Open
Browser as a tool	Demonstrates 3 ways to use a web browser as a tool with the Gemini API	Tools, Live API	Colab
Illustrate a book	Use Gemini and Imagen to create illustration for an open-source book	Imagen, structured output	Colab
Animated Story Generation	Create animated videos by combining story generation, images, and audio	Imagen, Live API, structured output	Colab
Plotting and mapping Live	Ask Gemini for complex graphs live	Live API, Code execution	Colab
Search grounding for research report	Use grounding to improve the quality of your research report	Grounding	Colab
Market a Jet Backpack	Create a marketing campaign from a product sketch	Multimodal	Colab
3D Spatial understanding	Use Gemini 3D spatial abilities to understand 3D scenes and answer questions about them	Multimodal, Spatial understanding	Colab
Video Analysis - Classification	Use Gemini's multimodal capabilities to classify animal species in videos	Video, Multimodal	Colab
Video Analysis - Summarization	Generate summaries of video content using Gemini	Video, Multimodal	Colab
Video Analysis - Event Recognition	Identify when historical events occurred in video footage	Video, Multimodal	Colab
Gradio and live API	Use gradio to deploy your own instance of the Live API	Live API	Python Code
Apollo 11 - long context example	Search a 400 page transcript from Apollo 11.	File API	Colab
Anomaly Detection	Use embeddings to detect anomalies in your datasets	Embeddings	Colab
Invoice and Form Data Extraction	Use the Gemini API to extract information from PDFs	File API, Structured Outputs	Colab
Opossum search	Code generation with the Gemini API. Just for fun, you'll prompt the model to create a web app called "Opossum Search" that searches Google with "opossum" appended to the query.	Code generation	Colab
Virtual Try-on	A Virtual Try-On application that utilizes Gemini 2.5 to create segmentation masks for identifying outfits in images, and Imagen 3 for generating and inpainting new outfits.	Spatial Understanding	Colab
Talk to documents	Use embeddings to search through a custom database.	Embeddings	Colab
Entity extraction	Use Gemini API to speed up some of your tasks, such as searching through text to extract needed information. Entity extraction with a Gemini model is a simple query, and you can ask it to retrieve its answer in the form that you prefer.	Embeddings	Colab
Google I/O 2025 Live coding session	Play with the notebook used during the Google I/O 2025 live coding session delivered by the Google DeepMind DevRel team. Work with the Gemini API SDK, know and practice with the GenMedia models, the thinking capable models, start using the Gemini API tools and more!	Gemini API and its models and features	Colab

Some old examples are still using the legacy SDK, they should still work and are still worth checking to get ideas:
Anomaly detection with embeddings: Detect data anomalies using embeddings.
Agents and Automatic Function Calling: Create an agent (Barrista-bot) to take your coffee order.
Classify text with embeddings: Use embeddings from the Gemini API with Keras.
Clustering with embeddings: Perform clustering on text datasets using embeddings.
Guess the shape: A simple example of using images in prompts.
Object detection: Extensive examples with object detection, including with multiple classes, OCR, visual question answering, and even an interactive demo.
Search Wikipedia with ReAct: Use ReAct prompting with Gemini Flash to search Wikipedia interactively.
Story writing with prompt chaining.ipynb: Write a story using two powerful tools: prompt chaining and iterative generation.
Tag and Caption images: Use the Gemini model's vision capabilities and the embedding model to add tags and captions to images of pieces of clothing.
Voice Memos: You'll use the Gemini API to help you generate ideas for your next blog post, based on voice memos you recorded on your phone, and previous articles you've written.
Search for information on documents: Perform searches across documents using embeddings.
Search Re-ranking with Embeddings: Use embeddings to re-rank search results.
Talk to documents: This is a basic intro to Retrieval Augmented Generation (RAG). Use embeddings to search through a custom database.
Translate a public domain: In this notebook, you will explore Gemini model as a translation tool, demonstrating how to prepare data, create effective prompts, and save results into a .txt file.
Working with Charts, Graphs, and Slide Decks: Gemini models are powerful multimodal LLMs that can process both text and image inputs. This notebook shows how Gemini Flash model is capable of extracting data from various images.
Entity extraction: Use Gemini API to speed up some of your tasks, such as searching through text to extract needed information. Entity extraction with a Gemini model is a simple query, and you can ask it to retrieve its answer in the form that you prefer.

Integrations
Personalized Product Descriptions with Weaviate: Load data into a Weaviate vector DB, build a semantic search system using embeddings from the Gemini API, create a knowledge graph and generate unique product descriptions for personas using the Gemini API and Weaviate.
Similarity Search using Qdrant: Load website data, build a semantic search system using embeddings from the Gemini API, store the embeddings in a Qdrant vector DB and perform similarity search using the Gemini API and Qdrant.
Movie Recommendation using Qdrant: Process and embed a large movie dataset with the Gemini API, index movie vectors in Qdrant, and build a semantic movie recommender that finds similar movies based on user queries using vector similarity search.
MLflow Tracing for Observability: Utilize MLflow tracing to capture detailed information about your interactions with Google GenAI APIs.

Folders
Prompting examples: A directory with examples of various prompting techniques.
JSON Capabilities: A directory with guides containing different types of tasks you can do with JSON schemas.
Automate Google Workspace tasks with the Gemini API: This codelabs shows you how to connect to the Gemini API using Apps Script, and uses the function calling, vision and text capabilities to automate Google Workspace tasks - summarizing a document, analyzing a chart, sending an email and generating some slides directly. All of this is done from a free text input.
Langchain examples: A directory with multiple examples using Gemini with Langchain.


