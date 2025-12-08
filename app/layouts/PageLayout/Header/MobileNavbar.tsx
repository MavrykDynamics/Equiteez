import { useEffect, memo } from "react";
import { useNavigate } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./MobileNavbar.module.css";
import { links } from "./header.consts";
import ArrowRight from "app/icons/arrow-right.svg?react";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { ButtonV2 } from "~/lib/atoms/ButtonV2/ButtonV2";

interface MobileNavbarProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const backdropVariants = {
  closed: { opacity: 0 },
  opened: { opacity: 0.8 },
};

const navbarVariants = {
  opened: { opacity: 1, height: "auto" },
  closed: { opacity: 0, height: 0 },
};

export const MobileNavbar = memo(
  ({ isOpen, toggleMenu }: MobileNavbarProps) => {
    const navigate = useNavigate();
    const { userAddress, signOut } = useUserContext();

    const isUserLoggedIn = Boolean(userAddress);

    const handleLogout = async () => {
      await signOut();
      toggleMenu();
    };

    const createOpenNextLinkHandler = (to: string) => () => {
      toggleMenu();
      navigate(to);
    };

    useEffect(() => {
      if (isOpen) {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = prev;
        };
      }
    }, [isOpen]);

    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === "Escape") toggleMenu();
      };

      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, toggleMenu]);

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.nav
              variants={navbarVariants}
              initial="closed"
              animate={isOpen ? "opened" : "closed"}
              exit="closed"
              className={styles.mobileNav}
            >
              <div className={styles.navList}>
                {links.map((link) => (
                  <button
                    key={link.id}
                    className={styles.navItem}
                    onClick={createOpenNextLinkHandler(link.to)}
                  >
                    <span>{link.text}</span>
                    <ArrowRight
                      width={24}
                      height={24}
                      stroke="var(--color-yellow-500)"
                    />
                  </button>
                ))}
              </div>
            </motion.nav>
            <motion.div
              onClick={toggleMenu}
              initial="closed"
              animate={isOpen ? "opened" : "closed"}
              exit="closed"
              variants={backdropVariants}
              className={styles.backdrop}
            />
          </>
        )}
      </AnimatePresence>
    );
  }
);

MobileNavbar.displayName = "MobileNavbar";

export default MobileNavbar;
