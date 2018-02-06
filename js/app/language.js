okulusApp.controller('LanguageCntrl', ['$routeParams', '$rootScope',
	function($routeParams, $rootScope){
		$rootScope.config ={
			bday:{maxDate:"2017-12-31",minDate:"1900-01-01"},
			week:{maxDate:"2018-12-31",minDate:"2018-01-01"},
			reports:{
						maxDate:"2018-12-31",minDate:"2017-01-01",
						minDuration:"0", maxDuration:"300"
					}
		};

		$rootScope.i18n = {
			navigation:{
				brand:"PIB Xalapa",
				user:{ groups:"Mis Grupos" },
				admin:{
					dashboard:"Admin Dashboard",
					monitor:"Monitor"
				}
			},
			btns:{
				saveBtn: "Guardar", newBtn: "Nuevo", deleteBtn: "Eliminar",
				cancelBtn: "Cancelar", sendBtn: "Enviar", yesBtn: "Si!", noBtn: "No!",
				newgroupBtn: "Nuevo", newMemberBtn: "Nuevo", addBtn: "+", viewBtn: "Ver",
				openBtn: "Abrir", closeBtn: "Cerrar",
				returnBtn: "Regresar", returnGroupsBtn: "Regresar a Grupos",
				returnAdminDashBtn: "Regresar al Dashboard"
			},
			alerts:{
				invalidForm:"Hay datos faltantes o incorrectos en el formulario.",
				confirmDelete: "Seguro que deseas eliminar este registro?"
			},
			titles:{
				groupsList: "Grupos Familiares",
				membersList: "Miembros"
			},
			forms:{
				weeks:{
					legend: "Semanas",
					week: "Semana",weekBtn:"Agregar",
					weekName: "Nombre", weekNameHint: "Semana 1",
				},
				access:{
					legend: "Miembros con Accceso al Grupo",
					table:{
						memberName:"Miembro", memberId:"Id", date:"Desde"
					}
				},
				group:{
					legend: "Datos del Grupo",
					numberLbl:"#", numberHint:"1", typeLbl:"Tipo",
					nameLbl:"Nombre del Grupo", nameHint:"Semillas de Esperanza",
					emailLbl:"Correo", emailHint:"micorreo@gmail.com",
					shcLegend:"Horario de Servicio",
					schdDayLbl: "Día", schdTimeLbl: "Hora", schdTimeHint: "07:30 PM"
				},
				member:{
					legend: "Datos del miembro",
					fnameLbl:"Nombre", fnameHint:"Francisco Fernando",
					lnameLbl:"Apellido", lnameHint:"Gil Villalobos",
					snameLbl:"Alias", snameHint:"Fernando Gil",
					emailLbl:"Correo", emailHint:"micorreo@gmail.com",
					bdayLbl:"Fecha de nacimiento"
				},
				report:{
					title:"Datos generales de la Reunión",
					groupLbl:"Grupo", leadLbl: "Siervo",
					coLeadLbl: "Aprendiz", hostLbl: "Anfitrión",
					dateLbl: "Fecha de reunión", dateHint: "12/22/2017",
					durationLbl: "Duración (min)",
					weekLbl:"Semana", moneyLbl: "Ofrenda",
					statusLbl:"Estado de la Reunión",
					cancelStatusLbl:"Cancelada", okStatusLbl:"Realizada",
					notesLegend: "Notas", notesHint: "Agregar notas y comentarios de la reunión",
					attendanceLegend: "Asistencia",
					membersLbl: "Miembros", guestsLbl: "Invitados",
					maleLbl: "Hombres", femaleLbl: "Mujeres",
					maleAbrev: "H", femaleAbrev: "M",
					adultLbl: "Adultos", youngLbl:"Jovenes", kidLbl:"Niños",
					studyLegend: "Estudio", studyLbl: "Titulo", seriesLbl: "Serie"
				},
				phone:{
					phoneLbl:"Teléfono", phoneHint:"228 8112233"
				},
				search:{
					hint:"Buscar ..."
				},
				address:{
					legend: "Dirección",
					streetLbl:"Calle", streetHint:"Av. Principal",
					extNumberLbl: "Num ext", extNumberHint: "007",
					intNumberLbl: "Num int", intNumberHint: "1",
					zipLbl: "Codigo Postal", zipHint: "77777",
					cityLbl: "Ciudad", cityHint: "Xalapa",
					stateLbl: "Estado", stateHint: "Veracruz",
					countryLbl: "Pais", countryHint: "Mexico"
				},
				orgForm:{
					basicInfoFieldset: "Datos de la Organizacion",
					orgnameLbl:"Nombre de la Organizacion", orgNameHint: "Mi Organizacion",
					emailLbl:"Correo electronico", emailHint:"micorreo@gmail.com",
					urlLbl:"Sitio Web", urlHint:"http://www.misitio.com"
				}
			},
			admin:{
				dashboard:{
					titles:{
						resources: "Recursos",
						weekSection: "Semana",
						groupsList: "Grupos Familiares",
						membersList: "Miembros",
						reportsList: "Reportes de la Semana",
						attendance: "Asistencia Semanal",
						money: "Diezmo Semanal",
					},
					reportTable:{
						report:"Reporte",
						date:"Fecha",
						group:"Grupo",
						reunionStatus:"Reunión",
						duration: "Duración",
						money: "Diezmo",
						attendance: "Asistencia", view: "Ver"
					},
					orgBtn: "Organizacion",
					groupsBtn:"Grupos Familiares",
					membersBtn:"Miembros",
					reportsBtn:"Reportes",
					weeksBtn:"Semanas"
				},
				audit:{
					title: "Auditoria de Movimientos",
					select: "Revisar Movimientos en ",
					groupsOptn:"Grupos",
					membersOptn:"Miembros",
					reportsOptn:"Reportes",
					weeksOptn:"Semanas",
					norecords: "No hay registros disponibles",
					table:{
						action: "Accion", by:"Hecha por", on:"Hecha en", date:"Fecha"
					}
				}
			},
			success:{
				deleted:{
					title:"Eliminado el registro ..."
				}
			},
			error:{
				title:"Oooops!!",
				message:"Houston, We have some problems!"
			},
			dropdowns:{
				status:{
					label: "Activo/Inactivo",
					inactive: "Inactivo",
					active: "Activo"
				},
				weekdays:{
					mon:"Lunes", tue:"Martes", wed:"Miercoles", thu:"Jueves",
					fri:"Viernes", sat:"Sabado", sun:"Domingo"
				},
				gtype:{
					mix:"Mixto", men:"Hombres",women:"Mujeres",young:"Jovenes",pilot:"Piloto"
				}
			}
		};

	}
]);
