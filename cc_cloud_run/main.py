from fastapi import FastAPI, Form, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from google.cloud import firestore
from typing import Annotated
import datetime

app = FastAPI()

# mount static files
app.mount("/static", StaticFiles(directory="/app/static"), name="static")
templates = Jinja2Templates(directory="/app/template")

# init firestore client
db = firestore.Client()
votes_collection = db.collection("votes")


@app.get("/")
async def read_root(request: Request):
    # ====================================
    # ++++ START CODE HERE ++++
    # ====================================

    # stream all votes; count tabs / spaces votes, and get recent votes


    # get all votes from firestore collection
    tabsCount=0
    spacesCount=0
    votes = votes_collection.stream()
    # @note: we are storing the votes in `vote_data` list because the firestore stream closes after certain period of time
    vote_data = []

    for v in votes:
        newDoc = v.to_dict()
        vote_data.append(newDoc)

        if (newDoc["team"]=="TABS"):
            tabsCount+=1
        else:
            spacesCount+=1

    

    return templates.TemplateResponse("index.html", {
        "request": request,
        "tabs_count": tabsCount,
        "spaces_count": spacesCount,
        "recent_votes": vote_data
    })

    # ====================================
    # ++++ STOP CODE ++++
    # ====================================
    # return templates.TemplateResponse("index.html", {
    #     "request": request,
    #     "tabs_count": 0,
    #     "spaces_count": 0,
    #     "recent_votes": []
    # })


@app.post("/")
async def create_vote(team: Annotated[str, Form()]):
    if team not in ["TABS", "SPACES"]:
        raise HTTPException(status_code=400, detail="Invalid vote")

    # ====================================
    # ++++ START CODE HERE ++++
    # ====================================

    # create a new vote document in firestore
    # return {"detail": "Not implemented yet!"}
    votes_collection.add({
    "team": team,
    "time_cast": datetime.datetime.isoformat()
    })

    # ====================================
    # ++++ STOP CODE ++++
    # ====================================
