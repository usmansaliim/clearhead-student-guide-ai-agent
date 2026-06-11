# from google import genai
#
# API_KEY = "AQ.Ab8RN6KP0OaJrrPhnNr96kBnzjzVvgMUeU9AzqzJwkCJZzi8gQ"
# client = genai.Client(api_key=API_KEY)
#
# for model in client.models.list():
#     print(model.name)

import os
from dotenv import load_dotenv

load_dotenv()

# GOOD: Reading from the environment variables instead
api_key = os.getenv("GCP_API_KEY")