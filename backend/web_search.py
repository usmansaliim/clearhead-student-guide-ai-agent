import os
import re
from tavily import TavilyClient
from dotenv import load_dotenv

load_dotenv()

# Initialize Tavily Client
TAVILY_KEY = os.getenv("TAVILY_KEY")
tavily = TavilyClient(api_key=TAVILY_KEY) if TAVILY_KEY else None

def clean_query_for_nust(user_prompt: str) -> str:
    """
    Cleans up conversational clutter and extracts keywords while 
    ensuring the search is contextually tethered to NUST.
    """
    # Remove common filler phrases
    filler_phrases = [
        r"\bcan you search for\b", r"\blook up\b", r"\bfind out\b", 
        r"\bwhat is\b", r"\bis there any news about\b", r"\bdo you know about\b"
    ]
    
    cleaned = user_prompt.lower()
    for phrase in filler_phrases:
        cleaned = re.sub(phrase, "", cleaned)
    
    cleaned = cleaned.strip("? .!,'\"")
    
    # Force context anchor so Tavily doesn't fetch general international results
    if "nust" not in cleaned and "seecs" not in cleaned:
        cleaned = f"NUST Islamabad {cleaned}"
        
    return cleaned.strip()

def search_latest_updates(query: str) -> str:
    """
    Hits Tavily API to get up-to-date information on policies, 
    faculty changes, internships, or dates.
    """
    if not tavily:
        return "Search error: TAVILY_KEY is missing or invalid in your .env configuration."
    
    search_query = clean_query_for_nust(query)
    
    try:
        # Using 'advanced' search depth for deep policy/handbook parsing
        response = tavily.search(
            query=search_query,
            search_depth="advanced",
            max_results=3,
            include_answer=True
        )
        
        # If Tavily generates a direct synthesized answer, prioritize it
        if response.get("answer"):
            return response["answer"]
            
        # Fallback to structuring raw result snippets clearly
        results = response.get("results", [])
        if not results:
            return f"I couldn't find any recent online updates regarding '{search_query}'."
            
        compiled_results = []
        for res in results:
            compiled_results.append(f"Source: {res['title']} ({res['url']})\nContext: {res['content']}\n")
            
        return "\n---\n".join(compiled_results)
        
    except Exception as e:
        return f"An error occurred while fetching real-time data: {str(e)}"