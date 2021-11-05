import { screen, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import firebase from "../__mocks__/firebase";
import Firestore from "../app/Firestore";
import Router from "../app/Router";

describe("Given I am connected as an employee", () => {
  describe("When the page is loading", () => {
    test("Then page should load correctly", () => {
      const html = BillsUI({ loading: true})
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
    test("Then in case of error, error should display", () => {
      const html = BillsUI({ error: true})
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      // Simulating global environment
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue()})
      // Mocking local storage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Setting user as employee
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      // Setting location & launching router
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['Bills'] }})
      document.body.innerHTML = `<div id="root"></div>`
      Router()
      expect(screen.getByTestId('icon-window').classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  // Define Bills page
  describe("When I click on", () => {
    let billItems;
    beforeEach(() => {
      // Creating local storage and setting user type as employee
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
  
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      $.fn.modal = jest.fn()
  
      billItems = new Bills({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
        firestore: null,
        localStorage: window.localStorage
      })
    })

    // Test eye modal opening
    describe("the icon eye", () => {
      test("then the modal should open", () => {
        const iconEye = screen.getAllByTestId("icon-eye")[0]
        const handleClickIconEye = jest.fn(billItems.handleClickIconEye(iconEye))
        iconEye.addEventListener('click', handleClickIconEye)
        fireEvent.click(iconEye)
        expect(handleClickIconEye).toHaveBeenCalled()
        expect(screen.getByTestId("modaleFile")).toBeTruthy()
      })
    })

    describe("the new bill button", () => {
      test("then I should be redirected to the new bill page", () => {
        const buttonNewBill = screen.getByTestId("btn-new-bill")
        const handleClickNewBill = jest.fn(billItems.handleClickNewBill)
        buttonNewBill.addEventListener('click', handleClickNewBill)
        fireEvent.click(buttonNewBill)
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
      })
    })
  })

  // GET Integration test
  describe("When I navigate to bills page", () => {
    test("Then fetch bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get")
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toEqual(4)
    })
    test("fetches bills from an API and fails with 404 message error", () => {
      firebase.get.mockImplementationOnce(() => {
        Promise.reject(new Error("Erreur 404"))
      })

      const html = BillsUI({ error:"Erreur 404" })
      document.body.innerHTML = html
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches bills from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() => {
        Promise.reject(new Error("Erreur 500"))
      })

      const html = BillsUI({ error:"Erreur 500" })
      document.body.innerHTML = html
      const message = screen.getAllByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})