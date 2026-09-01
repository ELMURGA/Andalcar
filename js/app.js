/**
 * ANDALCAR - Web Application Logic
 * Interactive booking engine, fleet filter, monthly calculator, office locator, and modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  initBookingDates();
  initBookingForm();
  initFleetFilter();
  initVehicleModal();
  initMonthlyCalculator();
  initOfficeTabs();
  initFaqAccordion();
  initMobileDrawer();
  initScrollHeader();
});

/* ==========================================================================
   1. Booking Engine & Form Logic
   ========================================================================== */
function initBookingDates() {
  const f1Input = document.getElementById('pickupDate');
  const f2Input = document.getElementById('returnDate');

  if (!f1Input || !f2Input) return;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const returnDay = new Date(tomorrow);
  returnDay.setDate(returnDay.getDate() + 4);

  // Format to YYYY-MM-DD for native date input
  f1Input.value = formatDateForInput(tomorrow);
  f2Input.value = formatDateForInput(returnDay);
  f1Input.min = formatDateForInput(today);
  f2Input.min = formatDateForInput(tomorrow);

  f1Input.addEventListener('change', () => {
    const selectedPickup = new Date(f1Input.value);
    if (!isNaN(selectedPickup.getTime())) {
      const minReturn = new Date(selectedPickup);
      minReturn.setDate(minReturn.getDate() + 1);
      f2Input.min = formatDateForInput(minReturn);
      if (new Date(f2Input.value) <= selectedPickup) {
        f2Input.value = formatDateForInput(minReturn);
      }
    }
  });
}

function formatDateForInput(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateForCarGestion(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
  }
  return dateStr;
}

function initBookingForm() {
  const bookingForm = document.getElementById('heroBookingForm');
  const diffOfficeCheckbox = document.getElementById('diffOfficeCheckbox');
  const returnOfficeGroup = document.getElementById('returnOfficeGroup');
  const pickupOfficeSelect = document.getElementById('pickupOffice');
  const returnOfficeSelect = document.getElementById('returnOffice');

  if (diffOfficeCheckbox && returnOfficeGroup) {
    diffOfficeCheckbox.addEventListener('change', () => {
      if (diffOfficeCheckbox.checked) {
        returnOfficeGroup.style.display = 'flex';
        returnOfficeSelect.required = true;
      } else {
        returnOfficeGroup.style.display = 'none';
        returnOfficeSelect.required = false;
        returnOfficeSelect.value = pickupOfficeSelect.value;
      }
    });
  }

  if (pickupOfficeSelect && returnOfficeSelect) {
    pickupOfficeSelect.addEventListener('change', () => {
      if (!diffOfficeCheckbox.checked) {
        returnOfficeSelect.value = pickupOfficeSelect.value;
      }
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const oev = pickupOfficeSelect.value;
      const oevOption = pickupOfficeSelect.options[pickupOfficeSelect.selectedIndex];
      const oevtxt = oevOption ? oevOption.text : '';

      let orv = oev;
      let orvtxt = oevtxt;
      if (diffOfficeCheckbox.checked) {
        orv = returnOfficeSelect.value;
        const orvOption = returnOfficeSelect.options[returnOfficeSelect.selectedIndex];
        orvtxt = orvOption ? orvOption.text : '';
      }

      const f1Raw = document.getElementById('pickupDate').value;
      const f2Raw = document.getElementById('returnDate').value;
      const f1 = formatDateForCarGestion(f1Raw);
      const f2 = formatDateForCarGestion(f2Raw);
      const h1 = document.getElementById('pickupTime').value;
      const h2 = document.getElementById('returnTime').value;
      const edad = document.getElementById('driverAge').value || '25';
      const promo = document.getElementById('promoCode').value || '';
      const tipoVehiculoSelect = document.getElementById('vehicleType');
      const tipoVehiculo = tipoVehiculoSelect ? tipoVehiculoSelect.value : '';
      const nombreVehiculo = (tipoVehiculoSelect && tipoVehiculoSelect.selectedIndex > 0) 
        ? tipoVehiculoSelect.options[tipoVehiculoSelect.selectedIndex].text 
        : '';

      // Redirigir a la página de disponibilidad propia con los parámetros como query string
      const params = new URLSearchParams({
        oev,
        oevtxt,
        f1,
        h1,
        orv,
        orvtxt,
        f2,
        h2,
        edad,
        promo,
        tipovehiculo: tipoVehiculo,
        nombrevehiculo: nombreVehiculo,
        f1_raw: f1Raw,
        f2_raw: f2Raw,
        emp: 'andalcar'
      });
      window.location.href = `disponibilidad.html?${params.toString()}`;
    });
  }
}

/* ==========================================================================
   2. Fleet Showcase & Filtering
   ========================================================================== */
function initFleetFilter() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const carCards = document.querySelectorAll('.car-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.getAttribute('data-filter');

      carCards.forEach(card => {
        const categories = card.getAttribute('data-categories') || '';
        if (filter === 'all' || categories.split(' ').includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   3. Vehicle Details Modal
   ========================================================================== */
const fleetData = {
  'seat-ibiza': {
    name: 'SEAT Ibiza / León o similar',
    category: 'Económico & Compacto',
    price: '19€',
    seats: '5 Plazas',
    doors: '5 Puertas',
    luggage: '2 Maletas',
    transmission: 'Manual',
    fuel: 'Gasolina Eficiente',
    ac: 'Aire Acondicionado',
    img: 'assets/images/car_compact_economy.jpg',
    description: 'El vehículo perfecto para moverse con agilidad por Conil de la Frontera, Cádiz y los pueblos blancos. Máximo ahorro de combustible, fácil aparcamiento y gran confort para parejas o pequeñas familias.',
    features: [
      'Aire acondicionado digital y conexión Bluetooth / USB',
      'Asistencia en carretera 24/7 en toda Andalucía',
      'Seguro obligatorio con opción de Cobertura Total Sin Franquicia',
      'Cancelación gratuita y modificación flexible de reserva',
      'Entrega en hoteles, aeropuerto de Jerez o estación de tren'
    ]
  },
  'volvo-suv': {
    name: 'Volvo XC60 / Nissan Qashqai',
    category: 'Familiar & SUV',
    price: '34€',
    seats: '5 Plazas Grandes',
    doors: '5 Puertas',
    luggage: '4 Maletas',
    transmission: 'Automático / Secuencial',
    fuel: 'Diésel / Gasolina',
    ac: 'Climatizador Bizona',
    img: 'assets/images/car_family_suv.jpg',
    description: 'Espacio, elegancia y seguridad suprema para disfrutar de la Costa de la Luz. Equipado con los sistemas más avanzados de asistencia a la conducción, maletero generoso y postura elevada de confort.',
    features: [
      'Cambio automático suave y tracción inteligente',
      'Pantalla táctil con Apple CarPlay y Android Auto',
      'Ideal para equipajes familiares, carritos y tablas de surf',
      'Entrega prioritaria sin colas en aeropuertos',
      'Seguro a todo riesgo disponible al mejor precio garantizado'
    ]
  },
  'mercedes-van': {
    name: 'Mercedes-Benz Clase V / Vito Tourer',
    category: 'Furgoneta & Monovolumen (7-9 Plazas)',
    price: '65€',
    seats: '8-9 Plazas',
    doors: '5 Puertas (Doble Lateral)',
    luggage: '6 Maletas Grandes',
    transmission: 'Automático 9G-Tronic',
    fuel: 'Diésel Euro 6',
    ac: 'Climatización Multizona',
    img: 'assets/images/car_minivan_group.jpg',
    description: 'La solución definitiva para viajes en grupo, familias numerosas, traslados de golf o eventos en Cádiz y Sevilla. Confort de primera clase, puertas correderas amplias y maletero inmenso.',
    features: [
      'Capacidad real para hasta 9 adultos con equipaje completo',
      'Asientos ergonómicos modulares con tapicería prémium',
      'Sensores de aparcamiento y cámara de marcha atrás',
      'Conductores adicionales sin recargos abusivos',
      'Servicio VIP de entrega y recogida en aeropuertos de Málaga, Sevilla y Jerez'
    ]
  },
  'porsche-cabrio': {
    name: 'Porsche 718 Boxster / Cabriolet Sport',
    category: 'Cabriolet & Deportivo',
    price: '79€',
    seats: '2 Plazas Sport',
    doors: '2 Puertas',
    luggage: '2 Maletas Weekend',
    transmission: 'PDK Automático',
    fuel: 'Gasolina Alto Rendimiento',
    ac: 'Climatizador Automático',
    img: 'assets/images/car_cabrio_beach.jpg',
    description: 'Siente la brisa atlántica de Tarifa y las puestas de sol de Conil al volante de un deportivo descapotable inolvidable. Capota eléctrica ultra-rápida, sonido emocionante y diseño icónico.',
    features: [
      'Capota eléctrica con apertura en solo 9 segundos',
      'Llantas de aleación deportiva y chasis deportivo',
      'Experiencia de conducción única por la Costa de la Luz',
      'Vehículo mimado y desinfectado al 100% antes de cada entrega',
      'Atención personalizada con entrega en villa privada o resort'
    ]
  },
  'hybrid-velox': {
    name: 'Toyota RAV4 / C-HR Hybrid ECO',
    category: 'Híbrido & Etiqueta ECO',
    price: '38€',
    seats: '5 Plazas',
    doors: '5 Puertas',
    luggage: '3 Maletas',
    transmission: 'Automático e-CVT',
    fuel: 'Híbrido Autorrecargable (Etiqueta ECO)',
    ac: 'Climatizador Digital',
    img: 'assets/images/car_hybrid_eco.jpg',
    description: 'Movilidad ecológica y sostenible sin preocuparse por los enchufes. Bajísimo consumo en carretera y ciudad, acceso total a zonas de bajas emisiones y conducción suave y silenciosa.',
    features: [
      'Etiqueta medioambiental ECO de la DGT para acceso sin restricciones',
      'Modo 100% eléctrico EV para maniobras y ciudad',
      'Consumo medio ultrabajo desde solo 4.5 l/100km',
      'Carga inalámbrica de smartphone y navegador GPS integrado',
      'Cancelación gratuita y tarifa transparente sin letra pequeña'
    ]
  },
  'suv-touareg': {
    name: 'Volkswagen Touareg / Tiguan Allspace',
    category: 'SUV Prémium Todo Terreno',
    price: '49€',
    seats: '5-7 Plazas',
    doors: '5 Puertas',
    luggage: '5 Maletas',
    transmission: 'Automático Tiptronic',
    fuel: 'Diésel BlueMotion',
    ac: 'Clima 3 Zonas',
    img: 'assets/images/hero_andalucia_car.jpg',
    description: 'El SUV insignia de gran tamaño para recorrer Andalucía con máxima comodidad, insonorización prémium y aplomo en autopista y carreteras costeras.',
    features: [
      'Digital Cockpit con pantalla de alta resolución y navegación',
      'Control de crucero adaptativo y frenada de emergencia',
      'Gran capacidad de maletero de más de 800 litros',
      'Seguro a todo riesgo y asistencia 24h incluida',
      'Posibilidad de entrega en cualquier punto de Andalucía'
    ]
  }
};

function initVehicleModal() {
  const modalBackdrop = document.getElementById('vehicleModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const detailButtons = document.querySelectorAll('.btn-view-details');

  if (!modalBackdrop) return;

  detailButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const carId = btn.getAttribute('data-car-id');
      const car = fleetData[carId];
      if (!car) return;

      document.getElementById('modalCarImg').src = car.img;
      document.getElementById('modalCarImg').alt = car.name;
      document.getElementById('modalCategory').textContent = car.category;
      document.getElementById('modalTitle').textContent = car.name;
      document.getElementById('modalPrice').textContent = `Desde ${car.price}/día`;
      document.getElementById('modalSeats').textContent = car.seats;
      document.getElementById('modalTransmission').textContent = car.transmission;
      document.getElementById('modalLuggage').textContent = car.luggage;
      document.getElementById('modalDesc').textContent = car.description;

      const perksContainer = document.getElementById('modalPerks');
      perksContainer.innerHTML = '';
      car.features.forEach(feat => {
        const li = document.createElement('li');
        li.textContent = `✓ ${feat}`;
        perksContainer.appendChild(li);
      });

      const bookBtn = document.getElementById('modalBookBtn');
      if (bookBtn) {
        bookBtn.onclick = () => {
          modalBackdrop.classList.remove('open');
          document.body.style.overflow = '';
          const bookingWidget = document.getElementById('heroBookingForm');
          if (bookingWidget) {
            bookingWidget.scrollIntoView({ behavior: 'smooth' });
            const vType = document.getElementById('vehicleType');
            if (vType) {
              // Match approximate type
              if (carId.includes('suv')) vType.value = '2';
              else if (carId.includes('van')) vType.value = '3';
              else vType.value = '1';
            }
          }
        };
      }

      modalBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      modalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ==========================================================================
   4. Monthly Rental Interactive Calculator
   ========================================================================== */
function initMonthlyCalculator() {
  const monthsSelect = document.getElementById('calcMonths');
  const typeSelect = document.getElementById('calcType');
  const priceDisplay = document.getElementById('calcPriceDisplay');
  const monthlyWhatsappBtn = document.getElementById('monthlyWhatsappBtn');

  if (!monthsSelect || !typeSelect || !priceDisplay) return;

  const basePrices = {
    compact: 420,  // per month
    suv: 590,
    van: 890
  };

  const discountFactors = {
    '1': 1.0,
    '2': 0.95,
    '3': 0.90,
    '4': 0.86,
    '5': 0.83,
    '6': 0.80
  };

  function updatePrice() {
    const months = monthsSelect.value;
    const type = typeSelect.value;
    const base = basePrices[type] || 420;
    const factor = discountFactors[months] || 1.0;
    const monthlyRate = Math.round(base * factor);

    priceDisplay.innerHTML = `${monthlyRate}€ <small>/mes (IVA incl.)</small>`;

    if (monthlyWhatsappBtn) {
      const typeText = typeSelect.options[typeSelect.selectedIndex].text;
      const message = encodeURIComponent(`Hola Andalcar, deseo información y presupuesto para alquiler mensual de ${months} mes(es) para un vehículo ${typeText}.`);
      monthlyWhatsappBtn.href = `https://wa.me/34611722501?text=${message}`;
    }
  }

  monthsSelect.addEventListener('change', updatePrice);
  typeSelect.addEventListener('change', updatePrice);
  updatePrice();
}

/* ==========================================================================
   5. Office Locator Tabs
   ========================================================================== */
function initOfficeTabs() {
  const officeTabs = document.querySelectorAll('.office-tab-btn');
  const officeCards = document.querySelectorAll('.office-card');

  officeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      officeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const region = tab.getAttribute('data-region');

      officeCards.forEach(card => {
        const cardRegion = card.getAttribute('data-region');
        if (region === 'all' || cardRegion === region) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   6. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherContent = otherItem.querySelector('.faq-content');
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   7. Mobile Navigation Drawer
   ========================================================================== */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileDrawer');
  const closeBtn = document.getElementById('drawerCloseBtn');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
  });

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* ==========================================================================
   8. Header Scroll Behavior
   ========================================================================== */
function initScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}
