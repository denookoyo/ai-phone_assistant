from openai import OpenAI
from openai.types.chat import ChatCompletionMessageParam

client = OpenAI(api_key="sk-8pd39xP_dBW-Ib2D2z33STKd-_UgmPmJO3SMOPet3IT3BlbkFJDc2tro1jPhjSVvvLdu9Aab1Ch3NkSkLV4EcmMIkToA")

def get_ai_response(messages: list[dict]) -> str:
    formatted_messages: list[ChatCompletionMessageParam] = [
        {"role": m["role"], "content": m["content"]} for m in messages
    ]

    chat = client.chat.completions.create(
        model="gpt-4",
        messages=formatted_messages,
    )

    # Handles both content as str and list (for future multimodal)
    content = chat.choices[0].message.content
    if isinstance(content, str):
        return content.strip()
    elif isinstance(content, list):
        # Newer style multimodal list content
        text_part = next((item["text"] for item in content if item["type"] == "text"), "")
        return text_part.strip()
    else:
        return "[No response]"