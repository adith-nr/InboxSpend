import pandas as pd 
import numpy as np

import seaborn as sns
import matplotlib.pyplot as plt
import imaplib
import email
from email import policy
import os
from pypdf import PdfReader, PdfWriter
from tabula.io import read_pdf, convert_into
from bs4 import BeautifulSoup
import tempfile
import pdfplumber
import warnings
import json, datetime
warnings.filterwarnings('ignore')


IMAP_mail = "imap.gmail.com"  # Change based on email provider

with open("Cred.json", "r") as f:
    data = json.load(f)

EMAIL_ACCOUNT = data.get("Email", "").strip() #
EMAIL_PASSWORD = data.get("Password", "").strip() #  # Use App Password for security
BANK_COUSTOMER_ID = data.get("CustomerID", "").strip() #

MAILBOX = "INBOX"

# Connect to IMAP
mail = imaplib.IMAP4_SSL(IMAP_mail)
res, data = mail.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
if(res!='OK'):
    print("Wrong Credentials ")
    exit()
mail.select(MAILBOX)

# status, messages = mail.search(None, 'FROM "canarabank@canarabank.com" HEADER Subject "E- Pass Sheet" SINCE {date}')
status, messages = mail.search(None, 'FROM "canarabank@canarabank.com" HEADER Subject "E- Pass Sheet"')
email_ids = messages[0].split()

def New_DATA(filename, use_date = "2025-02-28"):
    # Step 1: Read the CSV file
    df = pd.read_csv(filename, parse_dates=["Date"])

    df = df[df["Credit"].isna()]

    # Step 2: Extract and format the date and time
    df["Extracted_DateTime"] = df["UPI_ID"].str.extract(r'(\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2})')
    df["Date_Time"] = df["Extracted_DateTime"].str.replace('/', '-').str[:-3]

    # Step 3: Select relevant columns
    df = df[['Date_Time', 'Date', 'UPI_ID', 'Debit']]

    # Step 4: Process the UPI_ID column
    df["UPI_ID"] = df["UPI_ID"].str.split("/")
    #print(df["Date_Time"])
    # Step 5: Convert Date_Time to datetime format
    df["Date_Time"] = pd.to_datetime(df["Date_Time"], format='%d-%m-%Y %H:%M', errors='coerce')

    #print(df["Date_Time"])
    #df.to_csv("final_1.csv", index=False)
    # Step 6: Initialize dictionaries for UPI_ID and errors
    UPI_ID = {}
    error = []

    # Step 7: Iterate through the DataFrame rows
    for n, row in enumerate(df.iterrows()):
        data = row[1].values

        date = str(data[1]).split(" ")[0]
        if pd.isna(data[0]):  # Check if data[0] is NaT
            time = "00:00"  # Default value for missing/invalid dates
        else:
            time = data[0].strftime('%H:%M')
        

        amt = float(data[3])

        s_data = data[2]

        try:
            for x, j in enumerate(s_data):
                if "@" in j:
                    id = s_data[x][:s_data[x].find("@")]
                    name = " ".join(s_data[3:x-1])
                    name = name.replace("\\n", "")  # Replace literal \n with an empty string
                    bank = s_data[x-1]

                    if id in UPI_ID.keys():
                        UPI_ID[id]["Transactions"] += 1
                        UPI_ID[id]["Total"] += amt
                    else:
                        UPI_ID[id] = {
                            "Name": name,
                            "Date": date,
                            "Time": time,
                            "Transactions": 1,
                            "Total": amt,
                            "Bank": bank
                        }
                    break
        except:
            error.append(n)

    # Step 8: Convert the UPI_ID dictionary to a DataFrame
    df = pd.DataFrame.from_dict(UPI_ID, orient='index')
    df.reset_index(inplace=True)
    df.rename(columns={'index': 'UPI_ID'}, inplace=True)

    # Step 9: Process the Name column
    df["Name"] = df["Name"].str.split(' ').apply(lambda x: x[0])

    # Step 10: Convert and extract date components
    

    df['Date'] = pd.to_datetime(df['Date'], format='%Y-%m-%d', errors='coerce')
    df['Date'].fillna(pd.to_datetime(df['Date'], format='%d-%b-%y', errors='coerce'), inplace=True)
    df["Full_Date"] = pd.to_datetime(df["Date"])

    df["Year"] = df["Full_Date"].dt.year
    df["Date"] = df["Full_Date"].dt.day
    df["Month"] = df["Full_Date"].dt.month

    # Step 11: Format the Time column
    df["Time"] = pd.to_datetime(df["Time"])
    df['Time'] = df['Time'].dt.strftime('%H:%M')

    # Step 12: Sort the DataFrame by Full_Date
    df = df.sort_values(by="Full_Date", ascending=False)

    # Step 13: Ensure all \n are removed from the Name column
    df["Name"] = df["Name"].str.replace("\\n", "", regex=False)  # Explicitly replace \n
    df["Name"] = df["Name"].str.replace(r"[\r\n\t]+", "", regex=True)
    df["UPI_ID"] = df["UPI_ID"].str.replace(r"[-\r\n\t]+", "", regex=True)
    # Step 14: Return the final DataFrame
    df =  df[['Full_Date', 'Time', 'UPI_ID', 'Name', 'Transactions', 'Total', 'Bank']].reset_index().drop(columns=["index"])
    df["Name"].replace("ASHOKKUM", "ASHOK", inplace=True)
    df["Name"].replace("ASHOKKUMAR", "ASHOK", inplace=True)
    df["Name"].replace("ASHOK", "GUPTA JI", inplace=True)

    df["Name"].replace("SURAJSIN", "AMUL", inplace=True)
    df["Name"].replace("SURAJ", "AMUL", inplace=True)
    df["Name"].replace("SURAJSINGH", "AMUL", inplace=True)

    df["Name"].replace("RANU", "JUICE CORNER", inplace=True)
    df["Name"].replace("RANUPASI", "JUICE CORNER", inplace=True)

    df["Name"].replace("RISHABH", "NESCAFE", inplace=True) 

    df["Name"].replace("SHIVKARAN", "NIGHT CANTEEN", inplace=True)

    data = df
    
    data["Full_Date"] = data["Full_Date"].dt.date

    use_date = pd.to_datetime(use_date).date()

    
    return data[~(data["Full_Date"] <= use_date)]
    

def collect_data(pdf_path, csv_file):
    # Open the PDF file
    with pdfplumber.open(pdf_path) as pdf:
        # Initialize an empty list to store table rows
        table_data = []

        # Iterate through each page in the PDF
        for page in pdf.pages:
            # Extract tables from the page
            tables = page.extract_tables()

            # If tables are found, append them to table_data
            for table in tables:
                table_data.extend(table)

        # Convert the table data into a DataFrame
        df = pd.DataFrame(table_data[2:], columns=['Date', 'UPI_ID', 'Debit', 'Credit', 'Balance'])

        # print(df)

        if os.path.exists(csv_file):
        # Read the existing CSV file
            existing_df = pd.read_csv(csv_file)
            # Append the new data to the existing DataFrame
            updated_df = pd.concat([existing_df, df], ignore_index=True)
        else:
            # If the CSV file does not exist, use the new DataFrame
            updated_df = df

        mask = updated_df["Date"].str.match(r"^\d{2}-[A-Za-z]{3}-\d{2}$")  # Matches '15-Mar-24' format

        # Convert only the matched rows
        updated_df.loc[mask, "Date"] = pd.to_datetime(updated_df.loc[mask, "Date"], format="%d-%b-%y").dt.strftime("%d-%m-%Y")
       
        updated_df.to_csv(csv_file, index=False)

        #print(f"Data has been saved/updated in {csv_file}")

        return updated_df


def main(use_date = "2025-02-24"):
    # IMAP Config
    path = os.getcwd()
    curr_dir = os.path.join(path,"Canara")
    csv_file_path = os.path.join(curr_dir, "data.csv")
    pdf_dir = os.path.join(curr_dir, "PDFs")
    csv_file_path = os.path.join(curr_dir, "data.csv")
    # os.makedirs(pdf_dir)

    for email_id in email_ids:
        typ, data = mail.fetch(email_id, '(RFC822)')
        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email)

        for part in msg.walk():

            date = str(part).split("\n")[2].strip()[5:16]
            date = date.split(" ")
            #print(date)
            #print(" ".join(date.split(" ")))

            content_type = part.get_content_type()
            content_disposition = part.get("Content-Disposition", "")

            if "attachment" in content_disposition or "application/pdf" in content_type:
                #print(part)
                    # Create a temporary filename with a .pdf extension
                # with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False, dir=curr_dir) as tmp_file:
                #     filename = tmp_file.name

                filename = f"test.pdf"
                filepath = os.path.join(pdf_dir, filename)
                
                
                if filename:
                    with open(filepath, "wb") as f:
                        f.write(part.get_payload(decode=True))
                    #print(f"Downloaded: {filename}")

                    # Attempt to read password-protected PDF
                    try:
                        reader = PdfReader(filepath)
                        password = BANK_COUSTOMER_ID  # Replace with actual password
                        if reader.is_encrypted:
                            reader.decrypt(password)
                        #print(f"PDF Content: {reader.pages[0].extract_text()}")

                        writer = PdfWriter()
                        for page in reader.pages:
                            writer.add_page(page)
                        
                        with open(filepath, "wb") as output_pdf:
                            writer.write(output_pdf)
                        #print(f"Decrypted PDF saved to: {filename}")

                        writer.close()
                        reader.close()

                        # Convert the PDF to CSV
                        DF = collect_data(filepath, csv_file_path)
                        
                    except Exception as e:
                        print(f"Error reading PDF: {e}")

    mail.logout()

    # Call the function
    DF = New_DATA(csv_file_path)
    data = DF
    
    data["Full_Date"] = pd.to_datetime(data["Full_Date"])
    data["Full_Date"] = data["Full_Date"]
    use_date = pd.to_datetime(use_date)


    return data[~(data["Full_Date"] <= use_date)]
  
path = os.getcwd()
curr_dir = os.path.join(path,"Canara")
csv_file_path = os.path.join(curr_dir, "data.csv")
pdf_dir = os.path.join(curr_dir, "PDFs")

f=open('date1.txt','r')
dt1=(f.read().strip().strip("'").strip('"'))
dt_object = datetime.datetime.strptime(dt1, "%d-%b-%Y")  
formatted_date = dt_object.strftime("%Y-%m-%d")



  
if os.path.exists(csv_file_path):
    data = New_DATA(csv_file_path, formatted_date)
    #print("Exitsting\n")
else:
    #date can me passed form here
    data = main(formatted_date)
    #print("new\n")

# print(data)



test = data.groupby("Name").agg({"Transactions": "sum", "Total": "sum"}).reset_index()
req_name = ["GUPTA JI", "JUICE CORNER", "NIGHT CANTEEN", "NESCAFE", "AMUL"]

TotalCost = data["Total"].sum()
NC_Cost = 0
Amul_cost = 0
Nescafe_Cost = 0
Gupta_cost = 0
Juice_cost = 0

for _, row in test[test["Name"].isin(req_name)].iterrows():

    if row["Name"] == "NIGHT CANTEEN":
        NC_Cost = row["Total"]
    elif row["Name"] == "AMUL":
        Amul_cost = row["Total"]
    elif row["Name"] == "NESCAFE":
        Nescafe_Cost = row["Total"]
    elif row["Name"] == "GUPTA JI":
        Gupta_cost = row["Total"]
    elif row["Name"] == "JUICE CORNER":
        Juice_cost = row["Total"]

ans = {
    "Transactions": int(test[test["Name"].isin(req_name)]["Transactions"].sum()),
    "Total": TotalCost,
    "NC": NC_Cost,
    "Amul": Amul_cost,
    "Nescafe": Nescafe_Cost,
    "Gupta": Gupta_cost,
    "Juice": Juice_cost
}

print(json.dumps(ans))
# print(ans)