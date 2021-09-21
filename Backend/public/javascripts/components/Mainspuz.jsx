class Menuspuz extends React.Component {
    render() {
        return (
            <div className="menuspuz">
                <div className="menubutton"><p>Список СПУЗов</p></div>
                <div className="menubutton"><p>Ответственные СПУЗов</p></div>
                <div className="menubutton"><p>Ответственные школ</p></div>
                <div className="menubutton"><p>Календарь туров</p></div>
            </div>
        )
    }
}


class Headerspuz extends React.Component {
    render() {
        return (
            <div className="headerspuz">
                <img className="gerb" src="../../img/gerb.png" />
            </div>
        )
    }
}

class Addspuz extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            OBJ: [],
            isModalOpen: false,
            isModalChangeOpen: false,
            isModalRemoveOpen: false,
            seluniversity: '',
            university_name: ''
        };
    }

    componentDidMount() {
        fetch(`/spisokspuz`)
            .then((res) => res.json())
            .then((json) => {
                this.setState({ OBJ: json });
            });
    }

    openModal() {
        this.setState({ isModalOpen: true });
    }
    openModalChange(e) {
        this.setState({ isModalChangeOpen: true, seluniversity: e });
    }
    openModalRemove(e, n) {
        this.setState({ isModalRemoveOpen: true, seluniversity: e, university_name: n});
    }
    closeModal(e) {
        this.setState({ isModalOpen: false })
        if (e) {
            this.componentDidMount();
        }
    }
    closeModalChange(e) {
        this.setState({ isModalChangeOpen: false })
        if (e) {
            this.componentDidMount();
        }
    }
    closeModalRemove(e) {
        this.setState({ isModalRemoveOpen: false })
        if (e) {
            this.componentDidMount();
        }
    }

    render() {
        let spuzes = [];

        if (this.state.OBJ.length) {
            let Arr = this.state.OBJ
                .sort(function (a, b) {
                    return a.id_region - b.id_region;
                });

            Arr.map((list, index) => {
                spuzes.push(<tr><td>{index + 1}</td><td>{list.region}</td><td>{list.university_name}</td><td><div className="change" onClick={() => this.openModalChange(list.id_university)}>Изменить</div></td> <td><div className="delete" onClick={() => this.openModalRemove(list.id_university, list.university_name)}>Удалить</div></td></tr>)
            })
        }

        return (
            <div className="addspuz">
                <Headerspuz />
                <center>
                    <div>
                        <Modal isOpen={this.state.isModalOpen} closeprop={this.closeModal.bind(this)} />
                        <ModalChange isOpen={this.state.isModalChangeOpen} closeprop={this.closeModalChange.bind(this)} seluniversity={this.state.seluniversity} />
                        <ModalRemove isOpen={this.state.isModalRemoveOpen} closeprop={this.closeModalRemove.bind(this)} seluniversity={this.state.seluniversity} university_name={this.state.university_name} />
                    </div>

                    <h1>Список СПУЗов</h1>
                    <div width='100%'>
                        <div className="btn" onClick={() => this.openModal()}>Добавить</div>
                        <a href='/universities'><div className="btn" >Посмотреть</div></a>
                    </div>
                    <table className="spuzlist" width="1200px" >
                        <tr>
                            <td width="30px">№</td>
                            <td>Регион</td>
                            <td colSpan="3">Название</td>
                        </tr>
                        {spuzes}
                    </table>
                </center>

            </div>
        )
    }
}






class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            OBJregion: [],
            id_region: '',
            added: false
        };
    }


    componentDidMount() {
        fetch(`/getregion`)
            .then((res) => res.json())
            .then((json) => {
                this.setState({ OBJregion: json });
            });
    }

    handleChange(e) {
        this.setState({ id_region: e.target.value })
    }
    Addspuz = () => {
        let data = {
            "id_region": this.state.id_region,
            "s_university": document.getElementById("s_university").value,
            "s_university_kg": document.getElementById("s_university_kg").value,
            "university_name": document.getElementById("university_name").value,
            "university_address": document.getElementById("university_address").value,
            "university_url": document.getElementById("university_url").value,
            "university_supervisor": document.getElementById("university_supervisor").value,
            "supervisor_position": document.getElementById("supervisor_position").value,
            "university_name_kg": document.getElementById("university_name_kg").value,
            "university_sort": document.getElementById("university_sort").value
        }
        fetch(`/addspuz`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((res) => res.json())
            .then((json) => {
                this.setState({ added: json.res });
            });
    }

    render() {
        if (this.props.isOpen === false) {
            return null
        }
        if (this.state.added) {
            this.props.closeprop(true);
            this.setState({ added: false });
        }
        return (
            <div className="modal_add_spuz">

                <label>Регион</label>
                <select className="time" onChange={this.handleChange.bind(this)} >
                    <option value={0}> ---- </option>
                    {this.state.OBJregion.map((region) =>
                        <option value={region.id_region}>{region.region}</option>)
                    }
                </select><br />
                <label>Сокрашенное название спуза (на кыргызском)</label><br /><br />
                <input width="70%" type="text" id="s_university_kg" /><br /><br />
                <label>Сокрашенное название спуза (на русском)</label><br /><br />
                <input type="text" id="s_university" /><br /><br />
                <label>Полное название спуза (на кыргызском)</label><br /><br />
                <input type="text" id="university_name_kg" /><br /><br />
                <label>Полное название спуза (на русском)</label><br /><br />
                <input type="text" id="university_name" /><br /><br />
                <label>Адресс спуза</label><br /><br />
                <input type="text" id="university_address" /><br /><br />
                <label>WEB-сайт спуза</label>
                <input type="text" id="university_url" /><br /><br />
                <label>Руководитель спуза</label>
                <input type="text" id="university_supervisor" /><br /><br />
                <label>Должность руководителя спуза</label>
                <input type="text" id="supervisor_position" /><br /><br />
                <label>Сортировка среди спузов</label>
                <input type="number" id="university_sort" /><br />
                <div className="btn" onClick={() => this.props.closeprop()}>Отменить</div>
                <div className="btn" onClick={this.Addspuz}>Добавить</div>
            </div>
        )
    }
}

class ModalChange extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            OBJregion: [],
            changed: false,
            id_region: '',
            s_university: '',
            university_name: '',
            university_address: '',
            university_url: '',
            university_supervisor: '',
            supervisor_position: '',
            s_university_kg: '',
            university_name_kg: '',
            university_sort: '',
            Getdatas: false,
            updated: false
        };
    }

    Getdatas() {
        fetch(`/getregion`)
            .then((res) => res.json())
            .then((json) => {
                this.setState({ OBJregion: json });
            });

        fetch(`/getspuzinfo?id_university=` + this.props.seluniversity)
            .then((res) => res.json())
            .then((json) => {
                this.setState({
                    id_region: json.id_region,
                    s_university: json.s_university,
                    university_name: json.university_name,
                    university_address: json.university_address,
                    university_url: json.university_url,
                    university_supervisor: json.university_supervisor,
                    supervisor_position: json.supervisor_position,
                    s_university_kg: json.s_university_kg,
                    university_name_kg: json.university_name_kg,
                    university_sort: json.university_sort
                });
            });
    }



    handleChange(e) {
        this.setState({ id_region: e.target.value })
    }
    UpdateSpuz = () => {
        let data = {
            "id_region": this.state.id_region,
            "s_university": this.state.s_university,
            "s_university_kg": this.state.s_university_kg,
            "university_name": this.state.university_name,
            "university_address": this.state.university_address,
            "university_url": this.state.university_url,
            "university_supervisor": this.state.university_supervisor,
            "supervisor_position": this.state.supervisor_position,
            "university_name_kg": this.state.university_name_kg,
            "university_sort": Number(this.state.university_sort),
            "id_university": this.props.seluniversity
        }
        fetch(`/updatespuz`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((res) => res.json())
            .then((json) => {
                this.setState({ updated: json.res });
                this.Cansel();
            });
    }
    Cansel() {
        this.props.closeprop();
        this.setState({ OBJspuz: [] });
        this.setState({ Getdatas: false })
    }
    ChangeValue(e) {
        this.setState({ [e.target.id]: e.target.value })
    }
    render() {
        if (this.props.isOpen === false) {
            return null
        } else {
            if (!this.state.Getdatas) {
                this.Getdatas();
                this.setState({ Getdatas: true })
            }
        }
        if (this.state.updated) {
            this.props.closeprop(true);
            this.setState({ updated: false });
        }

        let selblock = []
        if (this.state.id_university !== '') {
            this.state.OBJregion.map((region) => {
                if (region.id_region == this.state.id_region) {
                    selblock.push(<option selected value={region.id_region}>{region.region}</option>)
                } else {
                    selblock.push(<option value={region.id_region}>{region.region}</option>)
                }
            })
            return (
                <div className="modal_add_spuz" >
                    <label>Регион</label>
                    <select className="time" onChange={this.handleChange.bind(this)} >
                        {selblock}
                    </select><br />
                    <label>Сокрашенное название спуза (на кыргызском)</label><br /><br />
                    <input width="70%" type="text" id="s_university_kg" onChange={this.ChangeValue.bind(this)} value={this.state.s_university_kg} /><br /><br />
                    <label>Сокрашенное название спуза (на русском)</label><br /><br />
                    <input type="text" id="s_university" onChange={this.ChangeValue.bind(this)} value={this.state.s_university} /><br /><br />
                    <label>Полное название спуза (на кыргызском)</label><br /><br />
                    <input type="text" id="university_name_kg" onChange={this.ChangeValue.bind(this)} value={this.state.university_name_kg} /><br /><br />
                    <label>Полное название спуза (на русском)</label><br /><br />
                    <input type="text" id="university_name" onChange={this.ChangeValue.bind(this)} value={this.state.university_name} /><br /><br />
                    <label>Адресс спуза</label><br /><br />
                    <input type="text" id="university_address" onChange={this.ChangeValue.bind(this)} value={this.state.university_address} /><br /><br />
                    <label>WEB-сайт спуза</label>
                    <input type="text" id="university_url" onChange={this.ChangeValue.bind(this)} value={this.state.university_url} /><br /><br />
                    <label>Руководитель спуза</label>
                    <input type="text" id="university_supervisor" onChange={this.ChangeValue.bind(this)} value={this.state.university_supervisor} /><br /><br />
                    <label>Должность руководителя спуза</label>
                    <input type="text" id="supervisor_position" onChange={this.ChangeValue.bind(this)} value={this.state.supervisor_position} /><br /><br />
                    <label>Сортировка среди спузов</label>
                    <input type="number" id="university_sort" onChange={this.ChangeValue.bind(this)} value={this.state.university_sort} /><br />
                    <div className="btn" onClick={() => this.Cansel()}>Отменить</div>
                    <div className="btn" onClick={this.UpdateSpuz}>Сохранить</div>
                </div>
            )
        } else {
            return null
        }

    }
}


class ModalRemove extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            removed: false
        };
    }


    RemoveSpuz = () => {
        let data = {
            "id_university": this.props.seluniversity
        }
        fetch(`/removespuz`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((res) => res.json())
            .then((json) => {
                this.setState({ removed: json.res });
                this.Cansel();
            });
    }
    Cansel() {
        this.props.closeprop();
    }

    render() {
        if (this.props.isOpen === false) {
            return null
        } 
        if (this.state.removed) {
            this.props.closeprop(true);
            this.setState({ removed: false });
        }

        
        if (this.props.seluniversity) {
            return (
                <div className="modal_add_spuz" >
                    <label>ВНИМАНИЕ!!!!</label><br /><br />
                    
                    <label>УДАЛИТЬ:</label><br /><br />
                    <label>"{this.props.university_name}"?</label><br /><br />
                    
                    <div className="btn" onClick={() => this.Cansel()}>Отменить</div>
                    <div className="btn" onClick={this.RemoveSpuz}>Удалить</div>
                </div>
            )
        } else {
            return null
        }

    }
}

class Mainspuz extends React.Component {
    render() {
        return (
            <div className="mainspuz">
                <Menuspuz />
                <Addspuz />
            </div>
        )
    }
}

ReactDOM.render(
    <Mainspuz />,
    document.getElementById("root")
)