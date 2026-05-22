# Import the csv module so the program can read and write CSV files.
import csv

# Import the os module so the program can check file existence
# and clear the screen depending on the operating system.
import os

# Import datetime so the program can record the current date for each sale.
from datetime import datetime

# Constant file name for the inventory database.
INVENTORY_FILE = "furniture_inventory.csv"

# Constant file name for the sales database.
SALES_FILE = "furniture_sales.csv"

# Define the main class for the furniture selling system.
class FurnitureSellingSystem:

    # Constructor method. This runs automatically when the class object is created.
    def __init__(self):
        # Call the file initialization method immediately so required CSV files exist.
        self.init_files()

    # Initialize CSV files if they are not yet created.
    def init_files(self):
        # Check whether the inventory file already exists.
        if not os.path.exists(INVENTORY_FILE):
            # Open the inventory file in write mode to create it.
            with open(INVENTORY_FILE, 'w', newline='') as f:
                # Create a CSV writer object.
                writer = csv.writer(f)
                # Write the header row for the inventory file.
                writer.writerow(["ID", "Name", "Category", "Price", "Stock"])

        # Check whether the sales file already exists.
        if not os.path.exists(SALES_FILE):
            # Open the sales file in write mode to create it.
            with open(SALES_FILE, 'w', newline='') as f:
                # Create a CSV writer object.
                writer = csv.writer(f)
                # Write the header row for the sales file.
                writer.writerow(["SaleID", "FurnitureID", "Date", "Quantity", "TotalPrice"])

    # Clear the terminal screen for cleaner program output.
    def clear(self):
        try:
            # Use 'cls' for Windows and 'clear' for Linux/Mac.
            os.system('cls' if os.name == 'nt' else 'clear')
        except:
            # Ignore any error if clearing the screen fails.
            pass

    # ================= INPUT VALIDATION =================

    # Get a text input and make sure it is not empty.
    def get_text(self, msg):
        while True:
            # Show the message and get user input.
            val = input(msg)

            # Check if the input becomes empty after removing spaces.
            if val.strip() == "":
                # Clear screen before showing the error message.
                self.clear()
                # Inform the user that blank input is not allowed.
                print("❌ Input cannot be empty.\n")
            else:
                # Return the valid text input.
                return val

    # Get a floating-point number such as a price.
    def get_float(self, msg):
        while True:
            # Ask the user for input.
            val = input(msg)
            try:
                # Convert the input into a float and return it if successful.
                return float(val)
            except:
                # Clear screen and show an error if conversion fails.
                self.clear()
                print("❌ Invalid number. Please enter a valid float.\n")

    # Get a non-negative integer such as stock quantity.
    def get_int(self, msg):
        while True:
            # Ask the user for input.
            val = input(msg)
            try:
                # Convert the input into an integer.
                iv = int(val)

                # Reject negative numbers.
                if iv < 0:
                    raise ValueError

                # Return the validated integer.
                return iv
            except:
                # Clear screen and show an error if the input is invalid.
                self.clear()
                print("❌ Invalid number. Please enter a valid non-negative integer.\n")

    # ================= CSV HELPERS =================

    # Read all data from a CSV file and return it as a list.
    def read_csv(self, file):
        try:
            # Open the file in read mode.
            with open(file, 'r') as f:
                # Convert the CSV reader result into a list and return it.
                return list(csv.reader(f))
        except:
            # Return an empty list if the file cannot be read.
            return []

    # Write all rows into a CSV file.
    def write_csv(self, file, data):
        try:
            # Open the file in write mode, replacing old content.
            with open(file, 'w', newline='') as f:
                # Create a CSV writer object.
                writer = csv.writer(f)
                # Write all rows from the provided data list.
                writer.writerows(data)
        except Exception as e:
            # Display the actual error message if writing fails.
            print(f"❌ Error writing file: {e}")

    # ================= INVENTORY CRUD =================

    # Add a new furniture item into the inventory.
    def add_furniture(self):
        try:
            # Clear the screen before showing the form.
            self.clear()
            print("=== ADD FURNITURE ITEM ===")

            # Get the furniture ID from the user.
            id = self.get_text("Furniture ID: ")

            # Get the furniture name from the user.
            name = self.get_text("Furniture Name: ")

            # Get the category from the user.
            category = self.get_text("Category: ")

            # Get the price and validate it as a float.
            price = self.get_float("Price: ")

            # Get the stock quantity and validate it as a non-negative integer.
            stock = self.get_int("Stock Quantity: ")

            # Open the inventory file in append mode to add one new row.
            with open(INVENTORY_FILE, 'a', newline='') as f:
                # Create a CSV writer object.
                writer = csv.writer(f)
                # Write the new furniture record into the inventory file.
                writer.writerow([id, name, category, price, stock])

            # Inform the user that the record was saved successfully.
            print("✅ Furniture added to inventory.")
            input("Press Enter...")
        except Exception as e:
            # Handle any unexpected error during the add process.
            print(f"❌ Error adding furniture: {e}")
            input("Press Enter...")

    # Display all furniture items currently stored in the inventory.
    def view_inventory(self):
        try:
            # Clear the screen before showing inventory.
            self.clear()
            print("=== FURNITURE INVENTORY ===")

            # Read all inventory records from the CSV file.
            data = self.read_csv(INVENTORY_FILE)

            # If there is only a header row or nothing at all, inventory is empty.
            if len(data) <= 1:
                print("No furniture found.")
            else:
                # Display the inventory in table format.
                self.display_table(data)

            input("Press Enter...")
        except Exception as e:
            # Handle any unexpected error while viewing inventory.
            print(f"❌ Error viewing inventory: {e}")
            input("Press Enter...")

    # Update an existing furniture record based on its ID.
    def update_furniture(self):
        try:
            # Clear the screen and show the update title.
            self.clear()
            print("=== UPDATE FURNITURE ===")

            # Ask the user for the furniture ID to update.
            fid = self.get_text("Enter Furniture ID to update: ")

            # Read all current inventory data.
            data = self.read_csv(INVENTORY_FILE)

            # Use a flag to track whether the record exists.
            found = False

            # Start from index 1 so the header row is skipped.
            for i in range(1, len(data)):
                # Check if the current row matches the entered furniture ID.
                if data[i][0] == fid:
                    found = True

                    # Show the old record before editing.
                    print("Old Record:", data[i])

                    # Replace each editable field with new validated input.
                    data[i][1] = self.get_text("New Name: ")
                    data[i][2] = self.get_text("New Category: ")
                    data[i][3] = self.get_float("New Price: ")
                    data[i][4] = self.get_int("New Stock Quantity: ")

                    # Save the modified inventory back to the CSV file.
                    self.write_csv(INVENTORY_FILE, data)
                    print("✅ Furniture updated.")
                    break

            # If no matching ID was found, show an error message.
            if not found:
                print("❌ Furniture ID not found.")

            input("Press Enter...")
        except Exception as e:
            # Handle any unexpected error while updating.
            print(f"❌ Error updating furniture: {e}")
            input("Press Enter...")

    # Delete a furniture record using its ID.
    def delete_furniture(self):
        try:
            # Clear the screen and show the delete title.
            self.clear()
            print("=== DELETE FURNITURE ===")

            # Ask the user for the furniture ID to delete.
            fid = self.get_text("Enter Furniture ID to delete: ")

            # Read all inventory data.
            data = self.read_csv(INVENTORY_FILE)

            # Start a new list with only the header row.
            new_data = [data[0]]

            # Track whether a matching record was found.
            found = False

            # Check every data row after the header.
            for row in data[1:]:
                # Keep rows whose ID does not match the target ID.
                if row[0] != fid:
                    new_data.append(row)
                else:
                    # Mark that the record to delete was found.
                    found = True

            # Save the filtered data only if a record was actually found.
            if found:
                self.write_csv(INVENTORY_FILE, new_data)
                print("✅ Furniture deleted.")
            else:
                print("❌ Furniture ID not found.")

            input("Press Enter...")
        except Exception as e:
            # Handle any unexpected error during deletion.
            print(f"❌ Error deleting furniture: {e}")
            input("Press Enter...")

    # ================= SALES =================

    # Record a sale and automatically reduce stock.
    def sell_furniture(self):
        try:
            # Clear the screen and show the sales form title.
            self.clear()
            print("=== RECORD SALE ===")

            # Get sale information from the user.
            sale_id = self.get_text("Sale ID: ")
            fid = self.get_text("Furniture ID: ")
            qty = self.get_int("Quantity Sold: ")

            # Read current inventory so stock can be checked.
            inventory = self.read_csv(INVENTORY_FILE)

            # Flag to track whether the furniture item exists.
            found = False

            # Search the inventory for the matching furniture ID.
            for i in range(1, len(inventory)):
                if inventory[i][0] == fid:
                    found = True

                    # Read the current stock and price from the matching row.
                    stock = int(inventory[i][4])
                    price = float(inventory[i][3])

                    # Prevent selling more than the available stock.
                    if qty > stock:
                        print("❌ Not enough stock!")
                        input("Press Enter...")
                        return

                    # Deduct the sold quantity from stock.
                    inventory[i][4] = str(stock - qty)

                    # Compute the total sale amount.
                    total_price = qty * price

                    # Save the updated inventory immediately.
                    self.write_csv(INVENTORY_FILE, inventory)
                    break

            # If furniture ID does not exist, stop the transaction.
            if not found:
                print("❌ Furniture ID not found.")
                input("Press Enter...")
                return

            # Get today's date in YYYY-MM-DD format.
            date = datetime.today().strftime("%Y-%m-%d")

            # Open the sales file in append mode to save the sale.
            with open(SALES_FILE, 'a', newline='') as f:
                writer = csv.writer(f)

                # Write one sale record containing sale ID, furniture ID, date,
                # quantity sold, and total price.
                writer.writerow([sale_id, fid, date, qty, total_price])

            # Show the total amount of the sale.
            print(f"✅ Sale recorded. Total: {total_price}")
            input("Press Enter...")
        except Exception as e:
            # Handle any unexpected error during sale recording.
            print(f"❌ Error recording sale: {e}")
            input("Press Enter...")

    # Display all recorded sales.
    def view_sales(self):
        try:
            # Clear the screen and show the title.
            self.clear()
            print("=== SALES RECORDS ===")

            # Read the sales CSV file.
            data = self.read_csv(SALES_FILE)

            # If there is only a header row, no sales have been recorded.
            if len(data) <= 1:
                print("No sales recorded.")
            else:
                # Display the sales data in table form.
                self.display_table(data)

            input("Press Enter...")
        except Exception as e:
            # Handle any unexpected error during viewing.
            print(f"❌ Error viewing sales: {e}")
            input("Press Enter...")

    # ================= FINANCIAL =================

    # Compute the total revenue from all sales.
    def total_revenue(self):
        try:
            # Clear the screen and show the report title.
            self.clear()
            print("=== TOTAL REVENUE ===")

            # Start total at zero.
            total = 0

            # Loop through every sales record after the header row.
            for row in self.read_csv(SALES_FILE)[1:]:
                try:
                    # Add the total price column to the running revenue.
                    total += float(row[4])
                except:
                    # Skip the row if there is invalid data.
                    continue

            # Display the final total revenue.
            print(f"💰 Total Revenue: {total}")
            input("Press Enter...")
        except Exception as e:
            # Handle any unexpected error during revenue calculation.
            print(f"❌ Error calculating revenue: {e}")
            input("Press Enter...")

    # ================= TABLE DISPLAY =================

    # Display any CSV data in a table-like layout.
    def display_table(self, data):
        try:
            # Separate the first row as headers.
            headers = data[0]

            # Get the actual data rows.
            rows = data[1:]

            # Start column widths based on header lengths.
            col_widths = [len(h) for h in headers]

            # Adjust each column width if row content is longer than the header.
            for row in rows:
                for i in range(len(row)):
                    col_widths[i] = max(col_widths[i], len(str(row[i])))

            # Print each header with left alignment and extra spacing.
            for i in range(len(headers)):
                print(headers[i].ljust(col_widths[i]+2), end="")
            print()

            # Print a separator line.
            print("-"*(sum(col_widths)+14))

            # Print each row using the computed column widths.
            for row in rows:
                for i in range(len(row)):
                    print(str(row[i]).ljust(col_widths[i]+2), end="")
                print()
        except:
            # Handle display problems in a simple way.
            print("❌ Error displaying table.")

    # ================= MAIN MENU =================

    # Main loop of the program.
    def run(self):
        while True:
            try:
                # Clear the screen and display the menu each cycle.
                self.clear()
                print("=== FURNITURE SELLING SYSTEM ===")
                print("1 Add Furniture")
                print("2 View Inventory")
                print("3 Update Furniture")
                print("4 Delete Furniture")
                print("5 Record Sale")
                print("6 View Sales")
                print("7 Total Revenue")
                print("8 Exit")

                # Ask the user for a menu choice.
                choice = input("Choice: ")

                # Call the matching function depending on user selection.
                if choice == "1":
                    self.add_furniture()
                elif choice == "2":
                    self.view_inventory()
                elif choice == "3":
                    self.update_furniture()
                elif choice == "4":
                    self.delete_furniture()
                elif choice == "5":
                    self.sell_furniture()
                elif choice == "6":
                    self.view_sales()
                elif choice == "7":
                    self.total_revenue()
                elif choice == "8":
                    # Stop the loop and end the program.
                    break
                else:
                    # Show an error if the entered choice is outside 1 to 8.
                    self.clear()
                    print("❌ Invalid choice. Please select 1-8.\n")
            except Exception as e:
                # Catch any unexpected error that happens inside the menu loop.
                self.clear()
                print(f"❌ Unexpected error: {e}")
                input("Press Enter...")

# ================= RUN SYSTEM =================

# Check whether this file is being run directly.
if __name__ == "__main__":
    # Create an object of the FurnitureSellingSystem class.
    app = FurnitureSellingSystem()

    # Start the main program loop.
    app.run()

