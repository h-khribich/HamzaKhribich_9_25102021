import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from '../constants/routes.js'
import firebase from "../__mocks__/firebase"
import firestore from "../app/Firestore";


describe("Given I am connected as an employee on new bill page", () => {
  let newBill;
  beforeEach(() => {
    // Creating local storage and setting user type as employee
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({ type: "Employee" }))
  })

  const html = NewBillUI()
  document.body.innerHTML = html
  newBill = new NewBill({
    document,
    onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
    firestore: null,
    localStorage: window.localStorage
  })

  describe("When I select a file", () => {
    test("Then it should added to the input", () => {
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const fileInput = screen.getByTestId("file")
      fileInput.addEventListener('change', handleChangeFile)
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["note-de-frais.jpg"], "note-de-frais.jpg", { type: "image/jpg"})]
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(fileInput.files[0].name).toBe("note-de-frais.jpg")
    })
  })

  describe("When I submit the form", () => {
    test("Then a new bill should be created", () => {
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillForm = screen.getByTestId("form-new-bill")
      newBillForm.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillForm)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})

// POST Integration test
describe("Given I am connected as an employee", () => {
  describe("When I create a new bill", () => {
    let bill = {
      "id": "47qAXb6fIm2zOKkLzMro",
      "vat": "80",
      "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      "status": "pending",
      "type": "Hôtel et logement",
      "commentary": "séminaire billed",
      "name": "encore",
      "fileName": "preview-facture-free-201801-pdf-1.jpg",
      "date": "2004-04-04",
      "amount": 400,
      "commentAdmin": "ok",
      "email": "a@a",
      "pct": 20
    }
    test("Then it should post bill from mock API", async () => {
      const getSpy = jest.spyOn(firebase, "post")
      const request = await firebase.post(bill)
      expect(request.status).toBe(200)
    })
    test("Then display with 404 error it fails", async () => {
      firebase.post.mockImplementationOnce(() => {
        Promise.reject(new Error("Erreur 404"))
      })

      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("Then display with error 500 is it fails", async () => {
      firebase.post.mockImplementationOnce(() => {
        Promise.reject(new Error("Erreur 500"))
      })

      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})