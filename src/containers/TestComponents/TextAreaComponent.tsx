import TextArea from 'components/TextArea';

export const TextAreaComponent = () => {
    return (
        <div style={{ width: 350, marginTop: 30 }}>
            <TextArea
                maxRows={5}
                label="Man in Panther's Skin"
                placeholder="This is placeholder"
                defaultValue={"By shedding tears of blood we praise King T'hamara, Whose praises I, not ill-chosen, have told forth. For ink I have used a lake of jet, and for pen a pliant crystal.Whoever hears, a jagged spear will pierce his heart!"}
            />
        </div>
    )
};